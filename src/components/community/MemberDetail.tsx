
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, Mail, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityLayout } from "./CommunityLayout";

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  city: string;
  country: string;
  skills: string[];
  personal_description: string;
  avatar_url: string;
};

export const MemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    
    const fetchMember = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, city, country, skills, personal_description, avatar_url")
          .eq("id", id)
          .single();

        if (error) throw error;
        setMember(data);
      } catch (error: any) {
        console.error("Error fetching member details:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du membre",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, toast]);

  return (
    <CommunityLayout loading={loading}>
      <Button 
        variant="outline" 
        className="mb-6 flex items-center gap-2"
        onClick={() => navigate("/community")}
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la communauté
      </Button>

      {member && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-muted rounded-lg p-6 flex-shrink-0 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-16 w-16 text-primary" />
                  </div>
                )}
              </Avatar>
              <h2 className="text-2xl font-bold text-center">
                {member.first_name} {member.last_name}
              </h2>
              
              {member.email && (
                <a 
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-muted-foreground mt-2 hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  {member.email}
                </a>
              )}
              
              {(member.city || member.country) && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  {[member.city, member.country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>

            <div className="flex-grow space-y-6 w-full">
              {member.personal_description && (
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-xl font-semibold">À propos</h3>
                  </CardHeader>
                  <CardContent>
                    <p>{member.personal_description}</p>
                  </CardContent>
                </Card>
              )}

              {member.skills && member.skills.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-xl font-semibold">Compétences</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, index) => (
                        <Badge key={index} className="bg-primary/10 text-primary border-primary/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </CommunityLayout>
  );
};
