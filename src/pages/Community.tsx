
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import MembersList from "@/components/community/MembersList";
import CommunityProjects from "@/components/community/CommunityProjects";
import { ArrowLeft, User, FileText, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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
  
  // Check if we should focus on projects tab from URL
  useEffect(() => {
    if (location.hash === '#projets') {
      setActiveTab("projets");
    }
  }, [location.hash]);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

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
        <div className="flex justify-start mb-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" /> Retour au Dashboard
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Communauté</h1>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Découvrez les membres</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Explorez les projets</span>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
