
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string;
  deadline: string | null;
  user_id: string | null;
}

interface CalendarSectionProps {
  userId: string;
}

const CalendarSection = ({ userId }: CalendarSectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [projectsWithDeadlines, setProjectsWithDeadlines] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Dates avec des projets (pour afficher des indicateurs dans le calendrier)
  const [datesWithProjects, setDatesWithProjects] = useState<Date[]>([]);
  
  useEffect(() => {
    fetchProjects();
  }, [userId]);

  const fetchProjects = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      // Récupérer uniquement les projets avec des deadlines
      const { data, error } = await supabase
        .from("personal_projects")
        .select("*")
        .eq("user_id", userId)
        .not("deadline", "is", null)
        .order("deadline", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setProjectsWithDeadlines(data || []);
      
      // Extraire les dates uniques pour les indicateurs du calendrier
      const dates = data
        .filter(project => project.deadline)
        .map(project => new Date(project.deadline as string));
      
      setDatesWithProjects(dates);
      
    } catch (error: any) {
      console.error("Erreur lors de la récupération des projets:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets avec deadlines",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les projets pour la date sélectionnée
  const projectsForSelectedDate = projectsWithDeadlines.filter(project => {
    if (!project.deadline) return false;
    
    const projectDate = new Date(project.deadline);
    return (
      projectDate.getDate() === selectedDate.getDate() &&
      projectDate.getMonth() === selectedDate.getMonth() &&
      projectDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "cancelled": return "bg-red-500";
      case "draft": return "bg-gray-500";
      default: return "bg-gray-300";
    }
  };

  // Traduire les statuts en français
  const translateStatus = (status: string | null) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "in_progress": return "En cours";
      case "completed": return "Terminé";
      case "cancelled": return "Annulé";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendrier de mes projets</CardTitle>
          <CardDescription>Visualisez vos échéances et planifiez votre temps</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement du calendrier...</span>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Calendrier */}
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  className="rounded-md border shadow p-3 pointer-events-auto"
                  locale={fr}
                  modifiers={{
                    highlighted: datesWithProjects
                  }}
                  modifiersClassNames={{
                    highlighted: "bg-primary/20"
                  }}
                />
              </div>
              
              {/* Liste des projets pour la date sélectionnée */}
              <div className="flex-1 border-l pl-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Projets pour le {format(selectedDate, "d MMMM yyyy", { locale: fr })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {projectsForSelectedDate.length === 0 
                      ? "Aucun projet prévu pour cette date" 
                      : `${projectsForSelectedDate.length} projet(s) prévu(s)`
                    }
                  </p>
                </div>
                
                {projectsForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {projectsForSelectedDate.map(project => (
                      <Card key={project.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{project.title}</h4>
                            {project.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                          <Badge className={`${getStatusColor(project.status)} text-white`}>
                            {translateStatus(project.status)}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground">Aucun projet pour cette date</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Les dates avec des projets sont surlignées dans le calendrier
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSection;
