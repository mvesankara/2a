
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FunctionsError } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PaymentType = "one_time" | "subscription";
type PaymentStatus = "none" | "one_time" | "subscription";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("none");
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Vérifier le statut du paiement
  const checkPaymentStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-payment-status");
      
      if (error) {
        throw error;
      }
      
      setStatus(data.paymentStatus);
      setHasCheckedStatus(true);
      return data.paymentStatus;
    } catch (error: FunctionsError) {
      console.error("Erreur lors de la vérification du statut de paiement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier votre statut de paiement",
        variant: "destructive",
      });
      return "none";
    } finally {
      setLoading(false);
    }
  };

  // Créer une session de paiement
  const createPaymentSession = async (paymentType: PaymentType) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-session", {
        body: { paymentType },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
        return true;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error: FunctionsError) {
      console.error("Erreur lors de la création de la session de paiement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    status,
    hasCheckedStatus,
    checkPaymentStatus,
    createPaymentSession,
  };
};
