import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Page affichée lorsque l'adresse email de l'utilisateur n'est pas vérifiée
 */
const VerifyEmail = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const resendEmail = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email envoyé", description: "Vérifiez votre boîte de réception." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Validation de l'email requise</h1>
      <p className="mb-4">
        Un email de confirmation a été envoyé à {user?.email}. Veuillez valider votre
        adresse pour accéder à votre espace.
      </p>
      <Button onClick={resendEmail}>Renvoyer l'email de confirmation</Button>
    </div>
  );
};

export default VerifyEmail;
