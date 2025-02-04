import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    console.log("User already logged in, redirecting to dashboard");
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Email envoyé",
          description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
        });
        setIsResetMode(false);
      } else {
        console.log("Attempting to sign in...");
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        console.log("Sign in successful, checking profile...");
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .single();

        console.log("Profile data:", profile);

        if (!profile?.first_name || !profile?.last_name) {
          console.log("Profile incomplete, redirecting to profile completion");
          navigate("/profile-completion");
        } else {
          console.log("Profile complete, redirecting to dashboard");
          navigate("/dashboard");
        }

        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">
            {isResetMode ? "Réinitialisation du mot de passe" : "Connexion"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isResetMode
              ? "Entrez votre email pour réinitialiser votre mot de passe"
              : "Connectez-vous à votre compte"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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

            {!isResetMode && (
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
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            <LogIn className="mr-2" />
            {loading
              ? isResetMode
                ? "Envoi en cours..."
                : "Connexion..."
              : isResetMode
              ? "Envoyer le lien"
              : "Se connecter"}
          </Button>

          <div className="flex flex-col space-y-2 text-center text-sm">
            <Button
              variant="link"
              type="button"
              onClick={() => setIsResetMode(!isResetMode)}
              className="p-0 h-auto font-semibold"
              disabled={loading}
            >
              {isResetMode
                ? "Retour à la connexion"
                : "Mot de passe oublié ?"}
            </Button>
            
            <p>
              Pas encore de compte ?{" "}
              <Button
                variant="link"
                onClick={() => navigate("/register")}
                className="p-0 h-auto font-semibold"
                disabled={loading}
              >
                S'inscrire
              </Button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;