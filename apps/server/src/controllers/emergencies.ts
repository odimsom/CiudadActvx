import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { database } from "../database";
import {
  CreateEmergencyData,
  EmergencyType,
  EmergencyStatus,
  EmergencyPriority,
} from "../types";

export class EmergencyController {
  // Obtener todas las emergencias
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.all(
        `
        SELECT * FROM emergencies 
        WHERE is_public = 1
        ORDER BY reported_at DESC
        `,
        (err: any, rows: any) => {
          if (err) {
            console.error("Error fetching emergencies:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          const emergencies = rows.map((row: any) => ({
            id: row.id,
            type: row.type,
            title: row.title,
            description: row.description,
            province: row.province,
            municipality: row.municipality,
            coordinates:
              row.latitude && row.longitude
                ? {
                    lat: row.latitude,
                    lng: row.longitude,
                  }
                : null,
            status: row.status,
            priority: row.priority,
            reportedBy: row.reported_by || "",
            reportedAt: new Date(row.reported_at),
            updatedAt: new Date(row.updated_at),
            resolvedAt: row.resolved_at ? new Date(row.resolved_at) : null,
            imageUrl: row.image_url,
            affectedPeople: row.affected_people,
            estimatedDamage: row.estimated_damage,
            response: row.response,
            isPublic: Boolean(row.is_public),
          }));

          res.json(emergencies);
        }
      );
    } catch (error) {
      console.error("Error in getAll emergencies:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Crear nueva emergencia
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateEmergencyData = req.body;
      const db = database.getDb();

      const emergencyId = uuidv4();
      const now = new Date().toISOString();

      // Generar título automático si no se proporciona
      const title =
        data.title || `${getEmergencyTypeName(data.type)} en ${data.province}`;

      db.run(
        `
        INSERT INTO emergencies (
          id, type, title, description, province, municipality,
          latitude, longitude, status, priority, reported_by, reported_at, updated_at,
          image_url, affected_people, estimated_damage, is_public
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          emergencyId,
          data.type,
          title,
          data.description || "",
          data.province,
          data.municipality || "",
          data.latitude || null,
          data.longitude || null,
          EmergencyStatus.ACTIVE,
          data.priority || EmergencyPriority.MEDIUM,
          data.reportedBy || "Usuario Anónimo",
          now,
          now,
          data.imageUrl || null,
          data.affectedPeople || null,
          data.estimatedDamage || null,
          1, // is_public
        ],
        function (err: any) {
          if (err) {
            console.error("Error creating emergency:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          // Crear notificación automática para emergencias críticas
          if (
            data.priority === EmergencyPriority.CRITICAL ||
            data.priority === EmergencyPriority.HIGH
          ) {
            EmergencyController.createEmergencyNotification(
              emergencyId,
              title,
              data.type,
              data.province
            );
          }

          res.status(201).json({
            id: emergencyId,
            message: "Emergencia reportada exitosamente",
            type: data.type,
            province: data.province,
            priority: data.priority || EmergencyPriority.MEDIUM,
          });
        }
      );
    } catch (error) {
      console.error("Error in create emergency:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Actualizar estado de emergencia
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, response } = req.body;
      const db = database.getDb();

      const now = new Date().toISOString();
      const resolvedAt = status === EmergencyStatus.RESOLVED ? now : null;

      db.run(
        `
        UPDATE emergencies 
        SET status = ?, response = ?, updated_at = ?, resolved_at = ?
        WHERE id = ?
        `,
        [status, response || null, now, resolvedAt, id],
        function (err: any) {
          if (err) {
            console.error("Error updating emergency status:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: "Emergencia no encontrada" });
          }

          res.json({
            message: "Estado de emergencia actualizado exitosamente",
            status,
            resolvedAt,
          });
        }
      );
    } catch (error) {
      console.error("Error in updateStatus emergency:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Obtener estadísticas de emergencias
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      // Obtener estadísticas generales
      db.get(
        `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
          SUM(CASE WHEN status = 'monitoring' THEN 1 ELSE 0 END) as monitoring,
          SUM(CASE WHEN datetime(reported_at) > datetime('now', '-24 hours') THEN 1 ELSE 0 END) as last24Hours
        FROM emergencies
        `,
        (err: any, row: any) => {
          if (err) {
            console.error("Error fetching emergency stats:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          // Obtener estadísticas por tipo
          db.all(
            "SELECT type, COUNT(*) as count FROM emergencies GROUP BY type",
            (err: any, typeRows: any) => {
              if (err) {
                console.error("Error fetching emergency type stats:", err);
                return res
                  .status(500)
                  .json({ error: "Error interno del servidor" });
              }

              // Obtener estadísticas por provincia
              db.all(
                "SELECT province, COUNT(*) as count FROM emergencies GROUP BY province ORDER BY count DESC LIMIT 10",
                (err: any, provinceRows: any) => {
                  if (err) {
                    console.error(
                      "Error fetching emergency province stats:",
                      err
                    );
                    return res
                      .status(500)
                      .json({ error: "Error interno del servidor" });
                  }

                  const byType: Record<string, number> = {};
                  typeRows.forEach((typeRow: any) => {
                    byType[typeRow.type] = typeRow.count;
                  });

                  const byProvince: Record<string, number> = {};
                  provinceRows.forEach((provinceRow: any) => {
                    byProvince[provinceRow.province] = provinceRow.count;
                  });

                  res.json({
                    total: row.total || 0,
                    active: row.active || 0,
                    resolved: row.resolved || 0,
                    monitoring: row.monitoring || 0,
                    byType,
                    byProvince,
                    last24Hours: row.last24Hours || 0,
                  });
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error("Error in getStats emergencies:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Método privado para crear notificación de emergencia
  private static createEmergencyNotification(
    emergencyId: string,
    title: string,
    type: EmergencyType,
    province: string
  ) {
    const db = database.getDb();
    const notificationId = uuidv4();
    const now = new Date().toISOString();

    const message = `🚨 ${getEmergencyTypeName(type)} reportada en ${province}. Se requiere atención inmediata.`;

    db.run(
      `
      INSERT INTO notifications (id, incident_id, type, title, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [notificationId, emergencyId, "emergency", `🚨 ${title}`, message, now],
      (err: any) => {
        if (err) {
          console.error("Error creating emergency notification:", err);
        } else {
          console.log("Emergency notification created successfully");
        }
      }
    );
  }
}

// Función helper para obtener nombre legible del tipo de emergencia
function getEmergencyTypeName(type: EmergencyType): string {
  const names: Record<EmergencyType, string> = {
    [EmergencyType.FLOOD]: "Inundación",
    [EmergencyType.EARTHQUAKE]: "Sismo",
    [EmergencyType.FIRE]: "Incendio",
    [EmergencyType.HURRICANE]: "Huracán",
    [EmergencyType.OTHER]: "Emergencia",
  };
  return names[type] || "Emergencia";
}
