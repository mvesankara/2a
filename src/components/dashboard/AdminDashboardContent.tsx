
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardExtended from "@/components/admin/AdminDashboardExtended";

/**
 * Composant pour le contenu du tableau de bord administrateur
 * Inclut la gestion des utilisateurs et des fonctionnalités administratives
 * @returns Le composant AdminDashboardContent
 */
const AdminDashboardContent = () => {
  const { data: profilesCount, isLoading: loadingProfiles } = useQuery({
    queryKey: ['profiles-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count ?? 0;
    }
  });

  const { data: articlesCount, isLoading: loadingArticles } = useQuery({
    queryKey: ['articles-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count ?? 0;
    }
  });

  const { data: eventsCount, isLoading: loadingEvents } = useQuery({
    queryKey: ['events-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count ?? 0;
    }
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card text-card-foreground rounded-xl shadow p-6">
          <h3 className="text-lg font-medium mb-2">Membres</h3>
          <p className="text-3xl font-bold">
            {loadingProfiles ? "..." : profilesCount}
          </p>
        </div>
        
        <div className="bg-card text-card-foreground rounded-xl shadow p-6">
          <h3 className="text-lg font-medium mb-2">Articles</h3>
          <p className="text-3xl font-bold">
            {loadingArticles ? "..." : articlesCount}
          </p>
        </div>
        
        <div className="bg-card text-card-foreground rounded-xl shadow p-6">
          <h3 className="text-lg font-medium mb-2">Événements</h3>
          <p className="text-3xl font-bold">
            {loadingEvents ? "..." : eventsCount}
          </p>
        </div>
      </div>
      
      <AdminDashboardExtended />
    </div>
  );
};

export default AdminDashboardContent;
