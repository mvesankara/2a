
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserDashboardContent from "@/components/dashboard/UserDashboardContent";
import AdminDashboardContent from "@/components/dashboard/AdminDashboardContent";

/**
 * Page du tableau de bord utilisateur
 * Affiche différentes sections selon le rôle de l'utilisateur (admin ou membre)
 * @returns Le composant Dashboard
 */
const Dashboard = () => {
  const { user } = useAuth();

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
    <DashboardLayout title="Mon Tableau de Bord">
      {isAdmin ? <AdminDashboardContent /> : <UserDashboardContent />}
    </DashboardLayout>
  );
};

export default Dashboard;
