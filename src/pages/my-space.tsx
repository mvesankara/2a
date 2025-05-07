
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ProjectorIcon, ArrowLeft } from "lucide-react";
import { ProfileLayout } from "@/components/profile/ProfileLayout";

import ProfileCard from "@/components/my-space/ProfileCard";
import ProjectsSection from "@/components/my-space/ProjectsSection";
import ArticlesSection from "@/components/my-space/ArticlesSection";

/**
 * Interface pour le type Projet
 */
interface Project {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  user_id: string | null;
}

/**
 * Composant Mon Espace
 * Permet à l'utilisateur de gérer son profil et ses projets personnels
 */
const MySpace = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState("projets");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  /**
   * Effet pour vérifier l'authentification et charger les données
   * si l'utilisateur est connecté
   */
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else {
      fetchProfile();
      fetchProjects();
    }
  }, [user, navigate]);

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (error) console.error("Erreur profil:", error);
    else setProfile(data);
    setLoading(false);
  };

  /**
   * Récupère les projets de l'utilisateur connecté
   * avec application du filtre de statut si actif
   */
  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from("personal_projects")
        .select("*")
        .eq("user_id", user?.id);
        
      if (activeTab === "projets" && projects.length > 0) {
        const statusFilter = projects[0].status;
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur projets:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos projets",
          variant: "destructive",
        });
      } else {
        setProjects(data || []);
      }
    } catch (error: any) {
      console.error("Erreur projets:", error);
    }
  };

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <ProfileLayout loading={loading}>
      <div className="flex justify-start mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" /> Retour au Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Section Profil */}
        <ProfileCard profile={profile} loading={loading} />

        {/* Tabs pour les projets et articles */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="projets" className="flex items-center gap-2">
              <ProjectorIcon className="h-4 w-4" />
              Mes Projets
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Mes Articles
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="projets">
            {/* Section Projets */}
            <ProjectsSection 
              projects={projects} 
              userId={user.id} 
              onProjectsChange={fetchProjects} 
            />
          </TabsContent>
          
          <TabsContent value="articles">
            {/* Section Articles */}
            <ArticlesSection onSuccess={() => setActiveTab("articles")} />
          </TabsContent>
        </Tabs>

        {/* Bouton de déconnexion */}
        <div className="flex justify-end">
          <Button onClick={handleLogout} variant="outline">
            Se déconnecter
          </Button>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default MySpace;
