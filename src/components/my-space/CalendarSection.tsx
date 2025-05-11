
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
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  type: string | null;
  created_by: string | null;
}

interface CalendarSectionProps {
  userId: string;
}

const CalendarSection = ({ userId }: CalendarSectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Dates avec des événements (pour afficher des indicateurs dans le calendrier)
  const [datesWithEvents, setDatesWithEvents] = useState<Date[]>([]);
  
  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const fetchEvents = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      // Récupérer tous les événements
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setEvents(data || []);
      
      // Extraire les dates uniques pour les indicateurs du calendrier
      const dates = data
        .filter(event => event.start_date)
        .map(event => new Date(event.start_date));
      
      setDatesWithEvents(dates);
      
    } catch (error: any) {
      console.error("Erreur lors de la récupération des événements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les événements pour la date sélectionnée
  const eventsForSelectedDate = events.filter(event => {
    if (!event.start_date) return false;
    
    const eventDate = new Date(event.start_date);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Fonction pour obtenir la couleur en fonction du type d'événement
  const getEventColor = (type: string | null) => {
    switch (type) {
      case "assemblee_generale": return "bg-primary";
      case "reunion_extraordinaire": return "bg-destructive";
      case "conseil_administration": return "bg-blue-500";
      case "reunion_bureau": return "bg-amber-500";
      case "reunion_commissions": return "bg-emerald-500";
      case "formation": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  // Traduire les types d'événements en français
  const translateEventType = (type: string | null) => {
    switch (type) {
      case "assemblee_generale": return "Assemblée générale";
      case "reunion_extraordinaire": return "Réunion extraordinaire";
      case "conseil_administration": return "Conseil d'administration";
      case "reunion_bureau": return "Réunion de bureau";
      case "reunion_commissions": return "Réunion de commissions";
      case "formation": return "Formation";
      default: return "Autre";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Calendrier des événements</CardTitle>
            <CardDescription>Visualisez les événements à venir</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link to="/events" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Tous les événements</span>
            </Link>
          </Button>
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
                    highlighted: datesWithEvents
                  }}
                  modifiersClassNames={{
                    highlighted: "bg-primary/20"
                  }}
                />
              </div>
              
              {/* Liste des événements pour la date sélectionnée */}
              <div className="flex-1 border-l pl-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Événements pour le {format(selectedDate, "d MMMM yyyy", { locale: fr })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {eventsForSelectedDate.length === 0 
                      ? "Aucun événement prévu pour cette date" 
                      : `${eventsForSelectedDate.length} événement(s) prévu(s)`
                    }
                  </p>
                </div>
                
                {eventsForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {eventsForSelectedDate.map(event => (
                      <Card key={event.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="text-sm text-muted-foreground mt-1">
                              {format(new Date(event.start_date), 'HH:mm', { locale: fr })}
                              {event.end_date && ` - ${format(new Date(event.end_date), 'HH:mm', { locale: fr })}`}
                            </div>
                            {event.location && (
                              <p className="text-xs text-muted-foreground mt-1">
                                📍 {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-sm line-clamp-2 mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <Badge className={`${getEventColor(event.type)} text-white`}>
                            {translateEventType(event.type)}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground">Aucun événement pour cette date</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Les dates avec des événements sont surlignées dans le calendrier
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/events">
                        Voir tous les événements
                      </Link>
                    </Button>
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
