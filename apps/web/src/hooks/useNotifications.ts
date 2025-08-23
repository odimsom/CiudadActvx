import { useState, useEffect, useRef } from "react";
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
  const isInitialized = useRef(false);
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
      // Mark all notifications as read individually since markAllNotificationsAsRead doesn't exist
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((notif) =>
          ApiService.markNotificationAsRead(notif.id)
        )
      );
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
    // Evitar dobles ejecuciones en StrictMode
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    // Esperar a que incidentes haga su primera carga para priorizar ese endpoint
    const start = Date.now();
    const maxWaitMs = 10000; // 10s máximo
    const tryStart = () => {
      const done = (window as any).__incidentsFirstLoadDone;
      if (done || Date.now() - start > maxWaitMs) {
        loadNotifications();
      } else {
        setTimeout(tryStart, 300);
      }
    };
    tryStart();

    // Polling cada 5 minutos para notificaciones (reducido para evitar rate limiting)
    const intervalId = setInterval(loadNotifications, 300000);

    return () => {
      clearInterval(intervalId);
      isInitialized.current = false;
    };
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
