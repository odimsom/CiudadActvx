import { Request, Response } from "express";
import { database } from "../database";
import { CreateIncidentData } from "../types";
import { v4 as uuidv4 } from "uuid";

export default class IncidentController {
  // Obtener todos los incidentes
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.all(
        `
        SELECT 
          id, title, description, type_id, type_name, type_icon, type_color, type_category,
          latitude, longitude, address, status, priority, reported_by, 
          reported_at, updated_at, votes, views, photos, tags
        FROM incidents 
        ORDER BY reported_at DESC
      `,
        (err: any, rows: any) => {
          if (err) {
            console.error("Error fetching incidents:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          const incidents = rows.map((row: any) => ({
            id: row.id,
            type: {
              id: row.type_id,
              name: row.type_name,
              icon: row.type_icon,
              color: row.type_color,
              category: row.type_category,
              description: `Incidente de tipo ${row.type_name}`,
            },
            title: row.title,
            description: row.description,
            coordinates: {
              lat: row.latitude,
              lng: row.longitude,
            },
            address: row.address,
            status: row.status,
            priority: row.priority,
            reportedBy: row.reported_by || "",
            reportedAt: new Date(row.reported_at),
            updatedAt: new Date(row.updated_at),
            votes: row.votes,
            views: row.views,
            photos: row.photos ? JSON.parse(row.photos) : [],
            tags: row.tags ? JSON.parse(row.tags) : [],
          }));

          res.json(incidents);
        }
      );
    } catch (error) {
      console.error("Error in getAll:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Crear nuevo incidente
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateIncidentData = req.body;
      const db = database.getDb();

      const incidentId = uuidv4();
      const now = new Date().toISOString();

      db.run(
        `
        INSERT INTO incidents (
          id, title, description, type_id, type_name, type_icon, type_color, type_category,
          latitude, longitude, address, status, priority, reported_by, reported_at, updated_at,
          votes, views, photos, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          incidentId,
          data.title,
          data.description || "",
          data.typeId,
          data.typeName,
          data.typeIcon,
          data.typeColor,
          data.typeCategory,
          data.latitude,
          data.longitude,
          data.address || "",
          "pending",
          data.priority || "medium",
          data.reportedBy || "",
          now,
          now,
          0,
          0,
          JSON.stringify(data.photos || []),
          JSON.stringify(data.tags || []),
        ],
        function (err: any) {
          if (err) {
            console.error("Error creating incident:", err);
            return res
              .status(500)
              .json({ error: "Error al crear el incidente" });
          }

          // Crear notificación
          const notificationId = uuidv4();
          db.run(
            `
          INSERT INTO notifications (id, incident_id, type, title, message, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
            [
              notificationId,
              incidentId,
              "new_incident",
              "Nuevo incidente reportado",
              `Se reportó: ${data.title}`,
              now,
            ]
          );

          // Actualizar estadísticas
          IncidentController.updateStatistics();

          res.status(201).json({
            id: incidentId,
            message: "Incidente creado exitosamente",
          });
        }
      );
    } catch (error) {
      console.error("Error in create:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Votar por un incidente
  static async vote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'up' or 'down'
      const db = database.getDb();

      const increment = action === "up" ? 1 : -1;

      db.run(
        `
        UPDATE incidents 
        SET votes = votes + ?, updated_at = ?
        WHERE id = ?
      `,
        [increment, new Date().toISOString(), id],
        function (err: any) {
          if (err) {
            console.error("Error updating vote:", err);
            return res.status(500).json({ error: "Error al votar" });
          }

          if ((this as any).changes === 0) {
            return res.status(404).json({ error: "Incidente no encontrado" });
          }

          res.json({ message: "Voto registrado exitosamente" });
        }
      );
    } catch (error) {
      console.error("Error in vote:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Actualizar estadísticas
  static updateStatistics(): void {
    const db = database.getDb();

    db.get(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM incidents
    `,
      (err: any, row: any) => {
        if (!err && row) {
          db.run(
            `
          UPDATE statistics 
          SET total_incidents = ?, pending_incidents = ?, 
              in_progress_incidents = ?, resolved_incidents = ?,
              updated_at = ?
          WHERE id = 1
        `,
            [
              row.total,
              row.pending,
              row.in_progress,
              row.resolved,
              new Date().toISOString(),
            ]
          );
        }
      }
    );
  }
}
