
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePayment } from "@/hooks/usePayment";
import { CheckCircle2 } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkPaymentStatus } = usePayment();
  const [paymentType, setPaymentType] = useState<string>("payment");

  useEffect(() => {
    // Rafraîchir le statut de paiement
    checkPaymentStatus();
    
    // Récupérer le type de paiement depuis l'URL
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type) {
      setPaymentType(type);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-lg shadow-sm p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-primary mb-2">Paiement réussi</h1>
          
          <p className="text-muted-foreground mb-6">
            {paymentType === "subscription" 
              ? "Votre abonnement mensuel à l'Association 2A a été activé avec succès. Merci pour votre soutien !"
              : "Votre adhésion à l'Association 2A a été confirmée. Merci pour votre soutien !"}
          </p>
          
          <div className="space-y-3 w-full">
            <Button 
              className="w-full" 
              onClick={() => navigate("/dashboard")}
            >
              Accéder à mon espace
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/")}
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
