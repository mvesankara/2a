
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary">Chargement de votre espace...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default PrivateRoute;
