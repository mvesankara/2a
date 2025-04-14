
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthHeader from "@/components/auth/AuthHeader";

const Login = () => {
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const getTitle = () => {
    if (isResetMode) return "Réinitialisation du mot de passe";
    if (isSignUpMode) return "Inscription";
    return "Connexion";
  };

  const getDescription = () => {
    if (isResetMode) return "Entrez votre email pour réinitialiser votre mot de passe";
    if (isSignUpMode) return "Créez votre compte pour commencer";
    return "Connectez-vous à votre compte";
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setIsResetMode(false);
  };

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
