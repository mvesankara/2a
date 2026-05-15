"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Vérification de l&apos;email</h1>
      <p className="mb-4 text-muted-foreground">
        Un email de confirmation a été envoyé à <strong>{user?.email}</strong>.
        Veuillez vérifier votre boîte de réception.
      </p>
      <Button variant="outline" onClick={() => router.push("/my-space")}>
        Continuer quand même
      </Button>
    </div>
  );
}
