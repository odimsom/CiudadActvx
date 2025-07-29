import { Router } from "express";
import { EmergencyController } from "../controllers/emergencies";

const router: Router = Router();

// GET /api/emergencies - Obtener todas las emergencias públicas
router.get("/", EmergencyController.getAll);

// POST /api/emergencies - Crear nueva emergencia
router.post("/", EmergencyController.create);

// PUT /api/emergencies/:id/status - Actualizar estado de emergencia
router.put("/:id/status", EmergencyController.updateStatus);

// GET /api/emergencies/stats - Obtener estadísticas de emergencias
router.get("/stats", EmergencyController.getStats);

export default router;
