
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import MembersList from "@/components/community/MembersList";
import CommunityProjects from "@/components/community/CommunityProjects";
import { ArrowLeft, User, FileText, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Composant principal de la page Communauté
 * Permet de découvrir les membres et les projets de la communauté
 */
const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("membres");
  
  // Check if we should focus on projects tab from URL or localStorage
  useEffect(() => {
    // Vérifier d'abord le hash dans l'URL
    if (location.hash === '#projets') {
      setActiveTab("projets");
    } 
    // Ensuite vérifier le localStorage
    else {
      const savedTab = localStorage.getItem('community_active_tab');
      if (savedTab === 'projets') {
        setActiveTab("projets");
        // Nettoyer après utilisation
        localStorage.removeItem('community_active_tab');
      }
    }
  }, [location.hash]);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  // Stats data (could be fetched from API in a real implementation)
  const communityStats = {
    members: 24,
    projects: 13,
    activeProjects: 8
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <CommunityLayout>
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-6">Communauté</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/10 hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Membres</p>
                  <p className="text-3xl font-bold">{communityStats.members}</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/10 hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projets</p>
                  <p className="text-3xl font-bold">{communityStats.projects}</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/10 hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projets actifs</p>
                  <p className="text-3xl font-bold">{communityStats.activeProjects}</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-start mb-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" /> Retour au Dashboard
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="membres">
          <TabsList className="mb-6">
            <TabsTrigger value="membres" className="flex items-center gap-1">
              <User className="h-4 w-4" /> Membres
            </TabsTrigger>
            <TabsTrigger value="projets" className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> Projets publics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="membres">
            <MembersList />
          </TabsContent>
          
          <TabsContent value="projets">
            <CommunityProjects />
          </TabsContent>
        </Tabs>
      </CommunityLayout>
    </>
  );
};

export default Community;
