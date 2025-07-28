import { Request, Response } from "express";
import { database } from "../database";
import { Statistics } from "../types";

export class StatisticsController {
  // Obtener estadísticas generales
  static async getGeneral(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.get(
        `
        SELECT * FROM statistics WHERE id = 1
      `,
        (err: any, row: any) => {
          if (err) {
            console.error("Error fetching statistics:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          if (!row) {
            return res.json({
              total_incidents: 0,
              pending_incidents: 0,
              in_progress_incidents: 0,
              resolved_incidents: 0,
              updated_at: new Date().toISOString(),
            });
          }

          const stats: Statistics = {
            total_incidents: row.total_incidents,
            pending_incidents: row.pending_incidents,
            in_progress_incidents: row.in_progress_incidents,
            resolved_incidents: row.resolved_incidents,
            updated_at: row.updated_at,
          };

          res.json(stats);
        }
      );
    } catch (error) {
      console.error("Error in getGeneral:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Obtener estadísticas por categoría
  static async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.all(
        `
        SELECT 
          type_category as category,
          COUNT(*) as count,
          AVG(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolution_rate
        FROM incidents
        GROUP BY type_category
        ORDER BY count DESC
      `,
        (err: any, rows: any[]) => {
          if (err) {
            console.error("Error fetching category statistics:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          const categoryStats = rows.map((row) => ({
            category: row.category,
            count: row.count,
            resolutionRate: Math.round(row.resolution_rate * 100),
          }));

          res.json(categoryStats);
        }
      );
    } catch (error) {
      console.error("Error in getByCategory:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Obtener estadísticas por mes
  static async getByMonth(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.all(
        `
        SELECT 
          strftime('%Y-%m', reported_at) as month,
          COUNT(*) as incidents,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
        FROM incidents
        WHERE reported_at >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', reported_at)
        ORDER BY month ASC
      `,
        (err: any, rows: any[]) => {
          if (err) {
            console.error("Error fetching monthly statistics:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          const monthlyStats = rows.map((row) => ({
            month: row.month,
            incidents: row.incidents,
            resolved: row.resolved,
            resolutionRate: Math.round((row.resolved / row.incidents) * 100),
          }));

          res.json(monthlyStats);
        }
      );
    } catch (error) {
      console.error("Error in getByMonth:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Obtener estadísticas de ubicación (zonas más problemáticas)
  static async getByLocation(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDb();

      db.all(
        `
        SELECT 
          ROUND(latitude, 3) as lat_zone,
          ROUND(longitude, 3) as lng_zone,
          COUNT(*) as incident_count,
          AVG(priority = 'high') as high_priority_rate
        FROM incidents
        GROUP BY ROUND(latitude, 3), ROUND(longitude, 3)
        HAVING incident_count > 1
        ORDER BY incident_count DESC
        LIMIT 20
      `,
        (err: any, rows: any[]) => {
          if (err) {
            console.error("Error fetching location statistics:", err);
            return res
              .status(500)
              .json({ error: "Error interno del servidor" });
          }

          const locationStats = rows.map((row) => ({
            zone: {
              lat: row.lat_zone,
              lng: row.lng_zone,
            },
            incidentCount: row.incident_count,
            highPriorityRate: Math.round(row.high_priority_rate * 100),
          }));

          res.json(locationStats);
        }
      );
    } catch (error) {
      console.error("Error in getByLocation:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
