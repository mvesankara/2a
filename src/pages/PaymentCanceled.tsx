
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-lg shadow-sm p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-primary mb-2">Paiement annulé</h1>
          
          <p className="text-muted-foreground mb-6">
            Votre paiement a été annulé. Aucun montant n'a été prélevé sur votre compte.
          </p>
          
          <div className="space-y-3 w-full">
            <Button 
              className="w-full" 
              onClick={() => navigate("/payment")}
            >
              Réessayer
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/dashboard")}
            >
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCanceled;
