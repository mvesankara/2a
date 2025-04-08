
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  paymentType: "one_time" | "subscription";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    "https://hgunnubcxkzcpzutsagn.supabase.co",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Récupérer l'utilisateur à partir du token d'autorisation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated or not found");
    }
    
    const user = userData.user;
    console.log("Creating payment session for user:", user.id);

    // Récupérer les détails du paiement depuis la requête
    const { paymentType }: PaymentRequest = await req.json();
    console.log("Payment type:", paymentType);
    
    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Vérifier si un client Stripe existe déjà pour cet utilisateur
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Using existing Stripe customer:", customerId);
    } else {
      // Créer un nouveau client Stripe
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = newCustomer.id;
      console.log("Created new Stripe customer:", customerId);
    }

    // Créer la session de paiement selon le type choisi
    let session;
    
    if (paymentType === "one_time") {
      // Option de paiement unique (30€)
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Adhésion Association 2A - Paiement unique",
                description: "Adhésion annuelle à l'association 2A (paiement unique)",
              },
              unit_amount: 3000, // 30€ en centimes
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin") || "https://hgunnubcxkzcpzutsagn.supabase.co"}/payment-success?type=one_time`,
        cancel_url: `${req.headers.get("origin") || "https://hgunnubcxkzcpzutsagn.supabase.co"}/payment-canceled`,
      });
    } else {
      // Option d'abonnement (2,99€/mois)
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Adhésion Association 2A - Mensuel",
                description: "Adhésion mensuelle à l'association 2A (prélèvement automatique)",
              },
              unit_amount: 299, // 2,99€ en centimes
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin") || "https://hgunnubcxkzcpzutsagn.supabase.co"}/payment-success?type=subscription`,
        cancel_url: `${req.headers.get("origin") || "https://hgunnubcxkzcpzutsagn.supabase.co"}/payment-canceled`,
      });
    }

    console.log("Payment session created successfully:", session.id);
    
    // Retourner l'URL de paiement Stripe
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create payment session" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
