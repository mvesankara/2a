"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    fetch("/api/notifications", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => setNotifications(data || []))
      .catch(console.error);
  }, [user]);

  const markAsRead = (id: string) => {
    const token = localStorage.getItem("token");
    fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(() => {
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    });
  };

  if (!user || notifications.length === 0) return null;

  return (
    <div className="space-y-2" role="list">
      {notifications.map((notification) => (
        <div key={notification.id} className="p-4 bg-card border rounded shadow" role="listitem">
          <div className="font-semibold">{notification.title}</div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          {!notification.isRead && (
            <button onClick={() => markAsRead(notification.id)} className="mt-2 text-xs text-primary hover:underline">
              Marquer comme lue
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
