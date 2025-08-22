import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean | null;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, is_read")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching notifications", error);
        return;
      }
      setNotifications(data || []);
    };
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) {
      console.error("Error marking notification as read", error);
      return;
    }
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  if (!user || notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" role="list">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="p-4 bg-card border rounded shadow"
          role="listitem"
        >
          <div className="font-semibold">{notification.title}</div>
          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>
          {!notification.is_read && (
            <button
              onClick={() => markAsRead(notification.id)}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Marquer comme lue
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

