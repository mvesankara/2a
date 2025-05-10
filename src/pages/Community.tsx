
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
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Composant principal de la page Communauté
 * Permet de découvrir les membres et les projets de la communauté
 */
const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("membres");

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
        
        <h1 className="text-3xl font-bold mb-6">Communauté</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="membres">Membres</TabsTrigger>
            <TabsTrigger value="projets">Projets publics</TabsTrigger>
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
