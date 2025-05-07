
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Newspaper } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-xl font-bold text-primary"
            onClick={() => navigate("/")}
          >
            2A
          </Button>
          
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/news")}
              className="flex items-center gap-2"
            >
              <Newspaper className="h-4 w-4" />
              Actualités
            </Button>
            
            {user ? (
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
              >
                Connexion
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
