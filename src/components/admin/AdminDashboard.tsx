
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Membres Inscrits
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {profilesLoading ? "..." : profiles?.length || 0}
          </div>
          <ScrollArea className="h-[200px] mt-4">
            {profiles?.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <Badge variant={profile.status === 'pending' ? 'outline' : 'default'}>
                  {profile.status}
                </Badge>
              </div>
            ))}
          </ScrollArea>
          <Button 
            className="w-full mt-4"
            onClick={() => navigate("/admin/members")}
          >
            Gérer les membres
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Événements à venir
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {eventsLoading ? "..." : events?.length || 0}
          </div>
          <ScrollArea className="h-[200px] mt-4">
            {events?.map((event) => (
              <div key={event.id} className="py-2">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.start_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </ScrollArea>
          <Button 
            className="w-full mt-4"
            onClick={() => navigate("/admin/events")}
          >
            Gérer les événements
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
