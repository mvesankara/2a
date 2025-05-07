
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Bell, FileText, Users, Calendar, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useQuery } from "@tanstack/react-query";

/**
 * Page du tableau de bord utilisateur
 * Affiche différentes sections selon le rôle de l'utilisateur (admin ou membre)
 * @returns Le composant Dashboard
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/", { replace: true });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  /**
   * Requête pour récupérer le profil de l'utilisateur connecté
   * Utilisé pour déterminer si l'utilisateur est administrateur
   */
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const isAdmin = profile?.role === 'administrateur';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Mon Espace Personnel</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/news")}
            >
              <Newspaper className="h-5 w-5" />
            </Button>
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
        {isAdmin && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Espace Administration</h2>
            <AdminDashboard />
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              onClick={() => navigate("/profile")}
            >
              Voir mon profil
            </Button>
          </div>

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

          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Newspaper className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Actualités</h2>
                <p className="text-sm text-muted-foreground">
                  Consultez et créez des actualités
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/news")}
            >
              Voir les actualités
            </Button>
          </div>

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

          <div className="bg-card rounded-lg shadow-lg p-6 mt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Mon espace</h2>
                <p className="text-sm text-muted-foreground">
                  Gérer mes infos, projets et plus
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/my-space")}>
              Accéder à mon espace
            </Button>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
