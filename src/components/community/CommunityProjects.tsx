
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProjectorIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  created_at: string;
  user_id: string;
  user: {
    first_name: string;
    last_name: string;
  };
};

/**
 * Composant pour afficher les projets communautaires
 */
const CommunityProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  /**
   * Récupère la liste des projets publics depuis la base de données
   */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("personal_projects")
        .select(`
          *,
          user:user_id (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });
        
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      const { data, error } = await query;

      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des projets:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des projets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtient la couleur du badge en fonction du statut
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Terminé</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-600">En cours</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  /**
   * Filtre les projets en fonction du terme de recherche
   */
  const filteredProjects = projects.filter((project) => {
    const titleMatch = project.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const creatorMatch = project.user?.first_name && project.user?.last_name
      ? `${project.user.first_name} ${project.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    
    return titleMatch || descMatch || creatorMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-semibold">Projets communautaires</h2>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="in-progress">En cours</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 flex flex-col space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <ProjectorIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium line-clamp-1">{project.title}</h3>
                    {project.user && (
                      <p className="text-xs text-muted-foreground">
                        Par {project.user.first_name} {project.user.last_name}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm line-clamp-3 mb-3">{project.description}</p>

                {project.deadline && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(project.deadline), "d MMMM yyyy", { locale: fr })}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between py-3 border-t">
                {project.status && getStatusBadge(project.status)}
                <div className="text-xs text-muted-foreground">
                  {format(new Date(project.created_at), "dd/MM/yyyy", { locale: fr })}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Aucun projet trouvé</p>
        </div>
      )}
    </div>
  );
};

export default CommunityProjects;
