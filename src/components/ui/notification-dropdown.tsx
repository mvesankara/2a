
import React from "react";
import { 
  Bell, 
  CheckCircle, 
  Calendar, 
  FileText, 
  MessageSquare,
  AlertCircle,
  Check
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types/notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'article':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'project':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      return "Date inconnue";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigation basée sur le type de notification
    if (notification.related_entity_id) {
      switch (notification.type) {
        case 'event':
          navigate(`/events?id=${notification.related_entity_id}`);
          break;
        case 'article':
          navigate(`/news/${notification.related_entity_id}`);
          break;
        case 'project':
          navigate(`/community?tab=projects&id=${notification.related_entity_id}`);
          break;
        case 'message':
          navigate(`/messages?id=${notification.related_entity_id}`);
          break;
        default:
          // Pour les notifications système, pas de navigation spécifique
          break;
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center" 
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead} 
              className="text-xs flex items-center h-7"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Tout marquer comme lu
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {loading ? (
            // État de chargement
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            // Aucune notification
            <div className="p-4 text-center text-sm text-muted-foreground">
              Vous n'avez pas de notifications.
            </div>
          ) : (
            // Liste des notifications
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`p-3 flex gap-2 cursor-pointer ${!notification.is_read ? 'bg-accent/10' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="flex-shrink-0 self-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
