
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    console.log("Checking payment status for user:", user.id);

    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Rechercher le client Stripe associé à cet utilisateur
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      // Aucun client Stripe trouvé, donc aucun paiement
      return new Response(
        JSON.stringify({ 
          hasActiveSubscription: false,
          hasOneTimePayment: false,
          paymentStatus: "none"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    let hasActiveSubscription = false;
    let hasOneTimePayment = false;

    // Vérifier si l'utilisateur a un abonnement actif
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    hasActiveSubscription = subscriptions.data.length > 0;

    // Vérifier si l'utilisateur a effectué un paiement unique
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 100,
    });
    
    // Filtrer les paiements réussis pour l'adhésion
    const successfulPayments = charges.data.filter(charge => 
      charge.status === "succeeded" && 
      charge.description?.includes("Adhésion Association 2A")
    );
    
    hasOneTimePayment = successfulPayments.length > 0;

    // Déterminer le statut global du paiement
    let paymentStatus = "none";
    if (hasActiveSubscription) {
      paymentStatus = "subscription";
    } else if (hasOneTimePayment) {
      paymentStatus = "one_time";
    }

    return new Response(
      JSON.stringify({ 
        hasActiveSubscription,
        hasOneTimePayment,
        paymentStatus
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking payment status:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to check payment status" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
