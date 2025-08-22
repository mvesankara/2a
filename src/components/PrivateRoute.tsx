import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { user, loading, emailVerified } = useAuth();

  useEffect(() => {
    console.log("PrivateRoute - User state:", { user, loading, emailVerified });
  }, [user, loading, emailVerified]);

 if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary">Chargement de votre espace...</span>
      </div>
    );
  }

  if (!user) {
    console.log("PrivateRoute - User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (!emailVerified) {
    console.log("PrivateRoute - Email not verified, redirecting to verify-email page");
    return <Navigate to="/verify-email" replace />;
  }

  console.log("PrivateRoute - User authenticated, rendering protected content");
  return element;
};

export default PrivateRoute;
