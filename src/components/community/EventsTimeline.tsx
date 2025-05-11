
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Calendar, ChevronsDown, ChevronsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Interface pour le type Événement
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

export const EventsTimeline = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Récupération des événements depuis la base de données
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(addMonths(currentMonth, 2)); // Afficher 3 mois
      
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .gte("start_date", startDate.toISOString())
          .lte("start_date", endDate.toISOString())
          .order("start_date", { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setEvents(data || []);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des événements:", error.message);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les événements",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentMonth, toast]);
  
  // Navigation entre les mois
  const previousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  // Grouper les événements par date
  const eventsByDate: Record<string, Event[]> = {};
  events.forEach(event => {
    const dateKey = event.start_date.split('T')[0];
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });
  
  // Générer tous les jours du mois en cours et des deux mois suivants
  const daysInRange = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(addMonths(currentMonth, 2))
  });
  
  // Basculer l'expansion d'un événement
  const toggleEventExpansion = (eventId: string) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chronologie des événements</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Visualisez les événements à venir dans les trois prochains mois
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-lg">Chargement des événements...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-2 text-lg font-medium">Aucun événement planifié</p>
                <p className="text-sm text-muted-foreground">
                  Utilisez le formulaire de création pour ajouter des événements
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-9 top-0 bottom-0 w-px bg-border" />
                
                {daysInRange.map(day => {
                  const dateKey = day.toISOString().split('T')[0];
                  const dayEvents = eventsByDate[dateKey] || [];
                  
                  // Ne pas afficher les jours sans événements
                  if (dayEvents.length === 0) return null;
                  
                  return (
                    <div key={dateKey} className="relative pl-12 pb-8">
                      <div className="absolute left-8 -translate-x-1/2 -translate-y-1/2">
                        <div className="h-5 w-5 rounded-full bg-primary" />
                      </div>
                      
                      <time className="mb-2 block text-sm font-bold text-muted-foreground">
                        {format(new Date(dateKey), 'EEEE d MMMM yyyy', { locale: fr })}
                      </time>
                      
                      <div className="space-y-3">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id} 
                            className="rounded-lg border bg-card p-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-lg font-semibold">{event.title}</h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>
                                    {format(new Date(event.start_date), 'HH:mm', { locale: fr })}
                                    {event.end_date && ` - ${format(new Date(event.end_date), 'HH:mm', { locale: fr })}`}
                                  </span>
                                </div>
                              </div>
                              
                              <Badge variant={
                                event.type === 'reunion_extraordinaire' ? 'destructive' :
                                event.type === 'assemblee_generale' ? 'default' : 'secondary'
                              }>
                                {event.type === 'reunion_extraordinaire' 
                                  ? 'Réunion extraordinaire' 
                                  : event.type === 'assemblee_generale' 
                                  ? 'Assemblée générale' 
                                  : event.type || 'Autre'}
                              </Badge>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            
                            <div className="mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-0 h-auto font-normal"
                                onClick={() => toggleEventExpansion(event.id)}
                              >
                                {expandedEvent === event.id ? (
                                  <span className="flex items-center">
                                    Voir moins <ChevronsUp className="ml-1 h-3 w-3" />
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    Voir plus <ChevronsDown className="ml-1 h-3 w-3" />
                                  </span>
                                )}
                              </Button>
                            </div>
                            
                            {expandedEvent === event.id && event.description && (
                              <div className="mt-2 border-t pt-2 text-sm">
                                <p>{event.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
