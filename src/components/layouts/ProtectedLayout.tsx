
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show loading state
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

  // Check if user is authenticated
  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  // Check permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-card rounded-lg border shadow">
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button 
            onClick={() => navigate("/dashboard")} 
            className="text-primary hover:underline"
          >
            Retourner au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // Check role if required
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-card rounded-lg border shadow">
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">
            Vous devez avoir le rôle {requiredRole} pour accéder à cette page.
          </p>
          <button 
            onClick={() => navigate("/dashboard")} 
            className="text-primary hover:underline"
          >
            Retourner au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // Render the protected content
  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50">
        <NotificationCenter />
      </div>
      {children}
    </div>
  );
};
