
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Bell, FileText, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/login", { replace: true });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Mon Espace Personnel</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profil */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Mon Profil</h2>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/profile-completion")}
            >
              Compléter mon profil
            </Button>
          </div>

          {/* Projets */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Mes Projets</h2>
                <p className="text-sm text-muted-foreground">
                  Suivez vos projets en cours
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Voir mes projets
            </Button>
          </div>

          {/* Événements */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Événements</h2>
                <p className="text-sm text-muted-foreground">
                  Calendrier des activités
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Voir le calendrier
            </Button>
          </div>

          {/* Communauté */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Communauté</h2>
                <p className="text-sm text-muted-foreground">
                  Découvrez les membres
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Explorer
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
