"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";

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
      await authApi.resetPassword(email);
      toast({ title: "Email envoyé", description: "Si cet email existe, un lien de réinitialisation vous a été envoyé." });
      onCancel();
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer l'email de réinitialisation", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" placeholder="vous@exemple.com" disabled={loading} />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer le lien"}
      </Button>

      <div className="flex flex-col space-y-2 text-center text-sm">
        <Button variant="link" type="button" onClick={onCancel} className="p-0 h-auto font-semibold" disabled={loading}>
          Retour à la connexion
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
