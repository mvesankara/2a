
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  country: string;
  skills: string[];
  personal_description: string;
};

/**
 * Composant pour afficher la liste des membres de la communauté
 */
const MembersList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  /**
   * Récupère la liste des membres depuis la base de données
   */
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, city, country, skills, personal_description")
        .not("first_name", "is", null)
        .order("last_name", { ascending: true });

      if (error) throw error;

      setMembers(data || []);
      
      // Extract unique skills for filtering
      const allSkills = data?.flatMap(member => member.skills || []) || [];
      const uniqueSkills = [...new Set(allSkills)];
      setAvailableSkills(uniqueSkills.sort());
      
      console.log("Fetched members:", data?.length);
      
    } catch (error: any) {
      console.error("Erreur lors de la récupération des membres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des membres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigue vers la page de détails du membre
   */
  const viewMemberDetails = (memberId: string) => {
    navigate(`/community/members/${memberId}`);
  };

  /**
   * Filtre les membres en fonction du terme de recherche et des filtres
   */
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const location = `${member.city || ""} ${member.country || ""}`.toLowerCase();
    const skills = member.skills ? member.skills.join(" ").toLowerCase() : "";
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      fullName.includes(searchLower) ||
      location.includes(searchLower) ||
      skills.includes(searchLower);
      
    const matchesSkill = 
      !skillFilter || 
      (member.skills && member.skills.some(skill => skill.toLowerCase() === skillFilter.toLowerCase()));
    
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-semibold">Membres</h2>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Rechercher par nom ou localisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select 
            value={skillFilter} 
            onValueChange={setSkillFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Compétence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les compétences</SelectItem>
              {availableSkills.map((skill) => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48">
              <CardContent className="pt-6 flex flex-col space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card 
              key={member.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => viewMemberDetails(member.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">{member.first_name} {member.last_name}</h3>
                </div>

                {(member.city || member.country) && (
                  <p className="text-sm text-muted-foreground mb-2 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {[member.city, member.country].filter(Boolean).join(", ")}
                  </p>
                )}

                {member.personal_description && (
                  <p className="text-sm mb-3 line-clamp-2">{member.personal_description}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                  {member.skills && member.skills.slice(0, 3).map((skill, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/5">
                      {skill}
                    </Badge>
                  ))}
                  {member.skills && member.skills.length > 3 && (
                    <Badge variant="outline">+{member.skills.length - 3}</Badge>
                  )}
                </div>

                <Button variant="ghost" size="sm" className="mt-1 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Voir le profil
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Aucun membre trouvé</p>
        </div>
      )}
    </div>
  );
};

export default MembersList;
