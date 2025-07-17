
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface définissant les propriétés du composant LoginForm
 */
interface LoginFormProps {
  onToggleMode: () => void;
  onToggleReset: () => void;
}

/**
 * Formulaire de connexion
 * Permet à l'utilisateur de se connecter avec son email et mot de passe
 * @param props - Les propriétés du composant
 * @returns Le composant LoginForm
 */
const LoginForm = ({ onToggleMode, onToggleReset }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Gère la soumission du formulaire de connexion
   * @param e - L'événement de soumission du formulaire
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Attempting to sign in...");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Sign in response:", { data, error: signInError });

      if (signInError) throw signInError;

      console.log("Sign in successful, redirecting to dashboard");
      
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });
      
      // The redirection is now handled by the Login page component
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = "Une erreur est survenue";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="mt-8 space-y-6">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        <LogIn className="mr-2" />
        {loading ? "Connexion..." : "Se connecter"}
      </Button>

      <div className="flex flex-col space-y-2 text-center text-sm">
        <Button
          variant="link"
          type="button"
          onClick={onToggleMode}
          className="p-0 h-auto font-semibold"
          disabled={loading}
        >
          Pas de compte ? S'inscrire
        </Button>
        <Button
          variant="link"
          type="button"
          onClick={onToggleReset}
          className="p-0 h-auto font-semibold"
          disabled={loading}
        >
          Mot de passe oublié ?
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
