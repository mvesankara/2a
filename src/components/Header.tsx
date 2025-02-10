
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

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
            >
              Actualités
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
            >
              Connexion
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
