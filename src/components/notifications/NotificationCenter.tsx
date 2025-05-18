
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, Check, Calendar, FileText, MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types/notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

export const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications
  } = useNotifications();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const navigate = useNavigate();

  const filteredNotifications = selectedTab === "all" 
    ? notifications 
    : selectedTab === "unread"
      ? notifications.filter(n => !n.is_read)
      : notifications.filter(n => n.type === selectedTab);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'article':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'project':
        return <Check className="h-4 w-4 text-primary" />;
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
    <Sheet>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshNotifications}
              >
                Actualiser
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="all" className="mt-4" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="unread">Non lus</TabsTrigger>
            <TabsTrigger value="event">Événements</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="project">Projets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <NotificationList 
              notifications={filteredNotifications}
              loading={loading}
              handleNotificationClick={handleNotificationClick}
              getNotificationIcon={getNotificationIcon}
              formatNotificationTime={formatNotificationTime}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="mt-4">
            <NotificationList 
              notifications={filteredNotifications}
              loading={loading}
              handleNotificationClick={handleNotificationClick}
              getNotificationIcon={getNotificationIcon}
              formatNotificationTime={formatNotificationTime}
            />
          </TabsContent>
          
          <TabsContent value="event" className="mt-4">
            <NotificationList 
              notifications={filteredNotifications}
              loading={loading}
              handleNotificationClick={handleNotificationClick}
              getNotificationIcon={getNotificationIcon}
              formatNotificationTime={formatNotificationTime}
            />
          </TabsContent>
          
          <TabsContent value="article" className="mt-4">
            <NotificationList 
              notifications={filteredNotifications}
              loading={loading}
              handleNotificationClick={handleNotificationClick}
              getNotificationIcon={getNotificationIcon}
              formatNotificationTime={formatNotificationTime}
            />
          </TabsContent>
          
          <TabsContent value="project" className="mt-4">
            <NotificationList 
              notifications={filteredNotifications}
              loading={loading}
              handleNotificationClick={handleNotificationClick}
              getNotificationIcon={getNotificationIcon}
              formatNotificationTime={formatNotificationTime}
            />
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">Fermer</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  handleNotificationClick: (notification: Notification) => void;
  getNotificationIcon: (type: Notification['type']) => React.ReactNode;
  formatNotificationTime: (dateString: string) => string;
}

const NotificationList = ({ 
  notifications, 
  loading, 
  handleNotificationClick,
  getNotificationIcon,
  formatNotificationTime
}: NotificationListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune notification à afficher
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4 mt-2">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`flex gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/50 ${
              !notification.is_read ? "bg-accent/10" : ""
            }`}
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
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
