import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Form submitted with:", { email, password, isResetMode, isSignUpMode });

    try {
      if (isResetMode) {
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
        setIsResetMode(false);
      } else if (isSignUpMode) {
        // Inscription
        console.log("Attempting to sign up...");
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`,
            },
          },
        });

        console.log("Sign up response:", { data, error: signUpError });

        if (signUpError) throw signUpError;

        toast({
          title: "Inscription réussie",
          description: "Bienvenue ! Vous pouvez maintenant vous connecter.",
        });
        setIsSignUpMode(false);
      } else {
        // Connexion
        console.log("Attempting to sign in...");
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
        
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = "Une erreur est survenue";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "Cet email est déjà utilisé. Veuillez vous connecter.";
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

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setIsResetMode(false);
    // Reset form fields when switching modes
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">
            {isResetMode 
              ? "Réinitialisation du mot de passe" 
              : isSignUpMode 
                ? "Inscription" 
                : "Connexion"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isResetMode
              ? "Entrez votre email pour réinitialiser votre mot de passe"
              : isSignUpMode
                ? "Créez votre compte pour commencer"
                : "Connectez-vous à votre compte"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {isSignUpMode && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium">
                    Prénom
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="John"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium">
                    Nom
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="Doe"
                    disabled={loading}
                  />
                </div>
              </>
            )}
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
            {isSignUpMode ? <UserPlus className="mr-2" /> : <LogIn className="mr-2" />}
            {loading
              ? isResetMode
                ? "Envoi en cours..."
                : isSignUpMode
                  ? "Inscription..."
                  : "Connexion..."
              : isResetMode
                ? "Envoyer le lien"
                : isSignUpMode
                  ? "S'inscrire"
                  : "Se connecter"}
          </Button>

          <div className="flex flex-col space-y-2 text-center text-sm">
            {!isResetMode && (
              <Button
                variant="link"
                type="button"
                onClick={toggleMode}
                className="p-0 h-auto font-semibold"
                disabled={loading}
              >
                {isSignUpMode
                  ? "Déjà un compte ? Se connecter"
                  : "Pas de compte ? S'inscrire"}
              </Button>
            )}
            {!isSignUpMode && (
              <Button
                variant="link"
                type="button"
                onClick={() => {
                  setIsResetMode(!isResetMode);
                  setIsSignUpMode(false);
                }}
                className="p-0 h-auto font-semibold"
                disabled={loading}
              >
                {isResetMode
                  ? "Retour à la connexion"
                  : "Mot de passe oublié ?"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
