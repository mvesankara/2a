
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserDashboardContent from "@/components/dashboard/UserDashboardContent";

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
    <DashboardLayout title="Mon Espace Personnel">
      {isAdmin && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Espace Administration</h2>
          <AdminDashboard />
        </div>
      )}
      
      <UserDashboardContent />
    </DashboardLayout>
  );
};

export default Dashboard;
