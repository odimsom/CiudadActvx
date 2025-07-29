import { useState, useEffect } from "react";
import { ApiService, type ApiNotification } from "../services/apiService";

export interface NotificationData {
  id: string;
  type: "incident" | "emergency" | "info";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  incidentId?: string;
}

// Converter function
const convertApiNotificationToAppFormat = (
  apiNotification: ApiNotification
): NotificationData => {
  return {
    id: apiNotification.id,
    type: apiNotification.type,
    title: apiNotification.title,
    message: apiNotification.message,
    createdAt: apiNotification.created_at,
    isRead: apiNotification.is_read,
    incidentId: apiNotification.incident_id,
  };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔔 useNotifications: Cargando notificaciones...");

      const apiNotifications = await ApiService.getNotifications();
      console.log("🔔 Notificaciones recibidas del API:", apiNotifications);
      console.log("🔔 Cantidad de notificaciones:", apiNotifications.length);

      const convertedNotifications = apiNotifications.map(
        convertApiNotificationToAppFormat
      );
      console.log("🔔 Notificaciones convertidas:", convertedNotifications);

      setNotifications(convertedNotifications);
      console.log("🔔 Estado de notificaciones actualizado");
    } catch (err) {
      console.error("❌ useNotifications: Error loading notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await ApiService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error("❌ Error marking all notifications as read:", err);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.isRead).length;
  };

  useEffect(() => {
    loadNotifications();

    // Polling cada 2 minutos para notificaciones
    const intervalId = setInterval(loadNotifications, 120000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    notifications,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  };
};
