
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * Page 404 affichée lorsqu'une route n'existe pas
 * Enregistre également l'URL de la tentative d'accès dans la console
 * @returns Le composant NotFound
 */
const NotFound = () => {
  const location = useLocation();

  /**
   * Effect qui enregistre l'URL de la page non trouvée dans la console
   */
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
