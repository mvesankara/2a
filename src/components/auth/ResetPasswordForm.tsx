
import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResetPasswordFormProps {
  onCancel: () => void;
}

const ResetPasswordForm = ({ onCancel }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Obtenir l'URL complète y compris protocole et domaine pour la redirection
      const origin = window.location.origin;
      const resetRedirectTo = `${origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectTo,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
      onCancel();
    } catch (error: AuthError) {
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
