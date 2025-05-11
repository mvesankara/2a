
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from "lucide-react";
import { EventsTimeline } from "./EventsTimeline";
import { EventForm } from "./EventForm";

export const EventsSection = () => {
  const [activeTab, setActiveTab] = useState("timeline");
  
  // Gestion du changement d'onglet
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Après création d'un événement, revenir à la chronologie
  const handleEventCreated = () => {
    setActiveTab("timeline");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Événements</h2>
        
        <div className="flex items-center gap-2">
          {activeTab === "timeline" ? (
            <Button 
              onClick={() => handleTabChange("create")}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Créer un événement
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => handleTabChange("timeline")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Voir la chronologie
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="timeline">Chronologie</TabsTrigger>
          <TabsTrigger value="create">Créer un événement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="pt-4">
          <EventsTimeline />
        </TabsContent>
        
        <TabsContent value="create" className="pt-4">
          <EventForm onSuccess={handleEventCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
