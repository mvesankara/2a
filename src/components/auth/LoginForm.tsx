"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  onToggleMode: () => void;
  onToggleReset: () => void;
}

const LoginForm = ({ onToggleMode, onToggleReset }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { token, user, profile } = await authApi.login(email, password);
      login(token, user, profile);
      toast({ title: "Connexion réussie" });
      router.replace("/my-space");
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
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
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" placeholder="vous@exemple.com" disabled={loading} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" disabled={loading} />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        <LogIn className="mr-2" />
        {loading ? "Connexion..." : "Se connecter"}
      </Button>

      <div className="flex flex-col space-y-2 text-center text-sm">
        <Button variant="link" type="button" onClick={onToggleMode} className="p-0 h-auto font-semibold" disabled={loading}>
          Pas de compte ? S&apos;inscrire
        </Button>
        <Button variant="link" type="button" onClick={onToggleReset} className="p-0 h-auto font-semibold" disabled={loading}>
          Mot de passe oublié ?
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
