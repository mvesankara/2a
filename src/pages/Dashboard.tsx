import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Mon Espace</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log("Logout clicked");
                navigate("/");
              }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Bienvenue sur votre espace personnel</h2>
                <p className="text-muted-foreground">
                  Gérez vos informations et préférences
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Informations personnelles</h3>
                <p className="text-sm text-muted-foreground">
                  Consultez et mettez à jour vos informations personnelles
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Paramètres</h3>
                <p className="text-sm text-muted-foreground">
                  Personnalisez les paramètres de votre compte
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;