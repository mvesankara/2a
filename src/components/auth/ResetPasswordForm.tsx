
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface définissant les propriétés du composant ResetPasswordForm
 */
interface ResetPasswordFormProps {
  onCancel: () => void;
}

/**
 * Formulaire de demande de réinitialisation de mot de passe
 * Envoie un email avec un lien de réinitialisation
 * @param props - Les propriétés du composant
 * @returns Le composant ResetPasswordForm
 */
const ResetPasswordForm = ({ onCancel }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Gère l'envoi du formulaire de réinitialisation
   * @param e - L'événement de soumission du formulaire
   */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Obtenir l'URL complète y compris protocole et domaine pour la redirection
      const origin = window.location.origin;
      const resetRedirectTo = `${origin}/reset-password`;
      
      console.log("Sending reset password email with redirect to:", resetRedirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectTo,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
      onCancel();
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            placeholder="vous@exemple.com"
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer le lien"}
      </Button>

      <div className="flex flex-col space-y-2 text-center text-sm">
        <Button
          variant="link"
          type="button"
          onClick={onCancel}
          className="p-0 h-auto font-semibold"
          disabled={loading}
        >
          Retour à la connexion
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
