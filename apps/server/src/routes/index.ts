import { Router } from "express";
import { StatisticsController } from "../controllers/statistics";
import { NotificationController } from "../controllers/notifications";
import IncidentController from "../controllers/incidents";
import emergencyRoutes from "./emergencies";

const router: Router = Router();

// Rutas de incidentes
router.get("/incidents", IncidentController.getAll);
router.post("/incidents", IncidentController.create);
router.post("/incidents/:id/vote", IncidentController.vote);

// Rutas de emergencias
router.use("/emergencies", emergencyRoutes);

// Rutas de estadísticas
router.get("/statistics", StatisticsController.getGeneral);
router.get("/statistics/category", StatisticsController.getByCategory);
router.get("/statistics/monthly", StatisticsController.getByMonth);
router.get("/statistics/location", StatisticsController.getByLocation);

// Rutas de notificaciones
router.get("/notifications", NotificationController.getAll);
router.get("/notifications/unread", NotificationController.getUnread);
router.post("/notifications/:id/read", NotificationController.markAsRead);
router.post("/notifications/read-all", NotificationController.markAllAsRead);

// Ruta de health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default router;
