"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  onToggleMode: () => void;
  onToggleReset?: () => void;
  redirectTo?: string;
}

export default function LoginForm({ onToggleMode, onToggleReset, redirectTo = "/dashboard" }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user, profile } = await authApi.login(identifier, password, rememberMe);
      login(token, user, profile, rememberMe);
      toast({ title: "Connexion réussie" });
      router.replace(redirectTo);
    } catch (error: unknown) {
      toast({
        title: "Identifiants incorrects",
        description: error instanceof Error ? error.message : "Vérifiez votre e-mail et votre mot de passe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-5">
      {/* E-mail / téléphone */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">
          Adresse e-mail ou téléphone
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Entrez votre e-mail ou numéro de téléphone"
            required
            disabled={loading}
            className="pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            required
            disabled={loading}
            className="pl-10 pr-12 h-12 rounded-xl border-gray-200 focus-visible:ring-primary"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex justify-end">
          <Link
            href="/mot-de-passe-oublie"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </div>

      {/* Se souvenir de moi */}
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(v) => setRememberMe(!!v)}
        />
        <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
          Se souvenir de moi
        </label>
      </div>

      {/* Bouton connexion */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Connexion en cours…" : "Se connecter"}
      </button>

      {/* Séparateur */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">ou</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Bouton Google */}
      <button
        type="button"
        onClick={() =>
          toast({
            title: "Bientôt disponible",
            description: "La connexion via Google sera disponible prochainement.",
          })
        }
        className="w-full h-12 rounded-xl border border-gray-200 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {/* Google logo SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
        </svg>
        Se connecter avec Google
      </button>

      {/* Lien inscription */}
      <p className="text-center text-sm text-gray-500">
        Vous n&apos;avez pas de compte ?{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="font-semibold text-primary hover:underline"
        >
          Créer un compte
        </button>
      </p>
    </form>
  );
}
