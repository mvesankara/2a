
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthHeader from "@/components/auth/AuthHeader";

/**
 * Page de connexion qui gère également l'inscription et la réinitialisation du mot de passe
 * Change d'affichage selon le mode sélectionné
 * @returns Le composant Login
 */
const Login = () => {
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  /**
   * Effect qui redirige vers le tableau de bord si l'utilisateur est déjà connecté
   */
  useEffect(() => {
    if (user && !loading) {
      console.log("User already logged in, redirecting to dashboard");
      navigate("/my-space", { replace: true });
    }
  }, [user, loading, navigate]);

  /**
   * Détermine le titre à afficher selon le mode actuel
   * @returns Le titre correspondant au mode
   */
  const getTitle = () => {
    if (isResetMode) return "Réinitialisation du mot de passe";
    if (isSignUpMode) return "Inscription";
    return "Connexion";
  };

  /**
   * Détermine la description à afficher selon le mode actuel
   * @returns La description correspondant au mode
   */
  const getDescription = () => {
    if (isResetMode) return "Entrez votre email pour réinitialiser votre mot de passe";
    if (isSignUpMode) return "Créez votre compte pour commencer";
    return "Connectez-vous à votre compte";
  };

  /**
   * Bascule entre le mode connexion et inscription
   */
  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setIsResetMode(false);
  };

  /**
   * Bascule entre le mode connexion et réinitialisation de mot de passe
   */
  const toggleReset = () => {
    setIsResetMode(!isResetMode);
    setIsSignUpMode(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <AuthHeader title={getTitle()} description={getDescription()} />

        {isResetMode ? (
          <ResetPasswordForm onCancel={toggleReset} />
        ) : isSignUpMode ? (
          <SignUpForm onToggleMode={toggleMode} />
        ) : (
          <LoginForm onToggleMode={toggleMode} onToggleReset={toggleReset} />
        )}
      </div>
    </div>
  );
};

export default Login;
