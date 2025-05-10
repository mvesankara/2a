
import { User, FileText, Newspaper, Calendar, Users } from "lucide-react";
import DashboardCard from "./DashboardCard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const UserDashboardContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fonction pour naviguer vers un onglet spécifique de My Space
  const navigateToTab = (tab: string) => {
    navigate('/my-space');
    // On utilise le localStorage pour indiquer quel onglet doit être sélectionné
    localStorage.setItem('myspace_active_tab', tab);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Mon Profil"
        description={user?.email || ""}
        icon={<User className="h-6 w-6 text-primary" />}
        buttonText="Voir mon profil"
        navigateTo="/profile"
      />
      
      <DashboardCard
        title="Mes Projets"
        description="Suivez vos projets en cours"
        icon={<FileText className="h-6 w-6 text-primary" />}
        buttonText="Voir mes projets"
        onClick={() => navigateToTab("projets")}
      />

      <DashboardCard
        title="Actualités"
        description="Consultez et créez des actualités"
        icon={<Newspaper className="h-6 w-6 text-primary" />}
        buttonText="Voir les actualités"
        navigateTo="/news"
      />

      <DashboardCard
        title="Événements"
        description="Calendrier des activités"
        icon={<Calendar className="h-6 w-6 text-primary" />}
        buttonText="Voir le calendrier"
        onClick={() => navigateToTab("calendrier")}
      />

      <DashboardCard
        title="Communauté"
        description="Découvrez les membres"
        icon={<Users className="h-6 w-6 text-primary" />}
        buttonText="Explorer"
      />

      <DashboardCard
        title="Mon espace"
        description="Gérer mes infos, projets et plus"
        icon={<Users className="h-6 w-6 text-primary" />}
        buttonText="Accéder à mon espace"
        navigateTo="/my-space"
      />
    </div>
  );
};

export default UserDashboardContent;
