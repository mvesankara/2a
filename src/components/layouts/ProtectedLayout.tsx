"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { UserRole } from "@/types/roles";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: UserRole;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
  requiredPermission,
  requiredRole
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, hasRole, loading: permissionsLoading } = usePermissions();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-card rounded-lg border shadow">
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button onClick={() => router.push("/my-space")} className="text-primary hover:underline">
            Retourner à mon espace
          </button>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-card rounded-lg border shadow">
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">
            Vous devez avoir le rôle {requiredRole} pour accéder à cette page.
          </p>
          <button onClick={() => router.push("/my-space")} className="text-primary hover:underline">
            Retourner à mon espace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50">
        <NotificationCenter />
      </div>
      {children}
    </div>
  );
};
