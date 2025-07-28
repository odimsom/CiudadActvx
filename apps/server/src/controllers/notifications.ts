import { Request, Response } from "express";
import { database } from "../database";
import { Notification } from "../types";

export class NotificationController {
  // Obtener todas las notificaciones
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.all(
        `
        SELECT * FROM notifications 
        ORDER BY created_at DESC 
        LIMIT 50
      `,
        (err: any, rows: any[]) => {
          if (err) {
            console.error("Error fetching notifications:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          const notifications: Notification[] = rows.map((row) => ({
            id: row.id,
            incident_id: row.incident_id,
            type: row.type,
            title: row.title,
            message: row.message,
            created_at: row.created_at,
            read_at: row.read_at,
          }));

          res.json(notifications);
        }
      );
    } catch (error) {
      console.error("Error in getAll notifications:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Obtener notificaciones no leídas
  static async getUnread(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.all(
        `
        SELECT * FROM notifications 
        WHERE read_at IS NULL
        ORDER BY created_at DESC
      `,
        (err: any, rows: any[]) => {
          if (err) {
            console.error("Error fetching unread notifications:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          const notifications: Notification[] = rows.map((row) => ({
            id: row.id,
            incident_id: row.incident_id,
            type: row.type,
            title: row.title,
            message: row.message,
            created_at: row.created_at,
            read_at: row.read_at,
          }));

          res.json(notifications);
        }
      );
    } catch (error) {
      console.error("Error in getUnread notifications:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Marcar notificación como leída
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const db = database.getDb();

      db.run(
        `
        UPDATE notifications 
        SET read_at = ?
        WHERE id = ? AND read_at IS NULL
      `,
        [new Date().toISOString(), id],
        function (err: any) {
          if (err) {
            console.error("Error marking notification as read:", err);
            return res
              .status(500)
              .json({ error: "Error al marcar como leída" });
          }

          if ((this as any).changes === 0) {
            return res
              .status(404)
              .json({ error: "Notificación no encontrada o ya leída" });
          }

          res.json({ message: "Notificación marcada como leída" });
        }
      );
    } catch (error) {
      console.error("Error in markAsRead:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Marcar todas las notificaciones como leídas
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.run(
        `
        UPDATE notifications 
        SET read_at = ?
        WHERE read_at IS NULL
      `,
        [new Date().toISOString()],
        function (err: any) {
          if (err) {
            console.error("Error marking all notifications as read:", err);
            return res
              .status(500)
              .json({ error: "Error al marcar todas como leídas" });
          }

          res.json({
            message: "Todas las notificaciones marcadas como leídas",
            count: (this as any).changes,
          });
        }
      );
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
