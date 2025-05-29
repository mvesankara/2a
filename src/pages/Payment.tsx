
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayment } from "@/hooks/usePayment";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CreditCard, CalendarClock } from "lucide-react";

const Payment = () => {
  const { loading, status, hasCheckedStatus, checkPaymentStatus, createPaymentSession } = usePayment();
  const { user } = useAuth();

  useEffect(() => {
    if (user && !hasCheckedStatus) {
      checkPaymentStatus();
    }
  }, [user, hasCheckedStatus, checkPaymentStatus]);

  const handlePayment = async (type: "one_time" | "subscription") => {
    await createPaymentSession(type);
  };

  if (loading && !hasCheckedStatus) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Vérification de votre statut de paiement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Adhésion à l'Association 2A</h1>
          <p className="text-muted-foreground">
            Choisissez votre méthode de paiement pour adhérer à notre association
          </p>
        </div>

        {status !== "none" ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Adhésion active
            </h2>
            <p className="text-green-700 mb-4">
              {status === "one_time" 
                ? "Vous avez payé votre adhésion en une fois. Merci pour votre soutien!"
                : "Vous êtes actuellement abonné à notre adhésion mensuelle. Merci pour votre soutien!"}
            </p>
            <Button variant="outline" onClick={() => checkPaymentStatus()}>
              Actualiser mon statut
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2" /> Paiement unique
                </CardTitle>
                <CardDescription>
                  Payez votre adhésion annuelle en une seule fois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">30€</p>
                  <p className="text-sm text-muted-foreground mt-1">Paiement unique</p>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Adhésion complète à l'association</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Valable pendant 1 an</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Accès à tous les événements</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handlePayment("one_time")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    "Payer 30€"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarClock className="mr-2" /> Paiement mensuel
                </CardTitle>
                <CardDescription>
                  Répartissez votre adhésion en paiements mensuels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">2,99€</p>
                  <p className="text-sm text-muted-foreground mt-1">par mois</p>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Adhésion complète à l'association</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Prélèvement automatique mensuel</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Résiliable à tout moment</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handlePayment("subscription")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    "S'abonner à 2,99€/mois"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
