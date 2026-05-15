"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthHeader from "@/components/auth/AuthHeader";

export default function LoginPage() {
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.replace("/my-space");
    }
  }, [user, loading, router]);

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
}
