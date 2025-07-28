import express, { Express } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import dotenv from "dotenv";
import { database } from "./database";
import routes from "./routes";

// Cargar variables de entorno
dotenv.config();

const PORT = parseInt(process.env.PORT || "3333", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

// Crear aplicación Express
const app: Express = express();

// Configurar middlewares de seguridad
app.use(helmet());

// Configurar CORS
app.use(
  cors({
    origin:
      NODE_ENV === "production"
        ? [
            "https://ciudadactiva.vercel.app",
            "https://ciudad-activa-landing.vercel.app",
          ]
        : [
            "http://localhost:3000",
            "http://localhost:4321",
            "http://localhost:5173",
          ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP por ventana
  message: {
    error: "Demasiadas solicitudes, intenta de nuevo en 15 minutos",
  },
});
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Usar rutas de la API
app.use("/api", routes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    name: "Ciudad Activa API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      incidents: "/api/incidents",
      statistics: "/api/statistics",
      notifications: "/api/notifications",
      health: "/api/health",
    },
  });
});

// Middleware de manejo de errores
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      message: NODE_ENV === "development" ? err.message : "Algo salió mal",
    });
  }
);

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    console.log("🔄 Iniciando Ciudad Activa API...");
    console.log(`📊 Ambiente: ${NODE_ENV}`);
    console.log(`🔧 Puerto configurado: ${PORT}`);

    // Inicializar base de datos
    database.initialize();
    console.log("✅ Base de datos inicializada correctamente");

    // Iniciar servidor
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Ciudad Activa API corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
      console.log(`📋 Health Check: http://0.0.0.0:${PORT}/api/health`);
      console.log("✅ Servidor listo para recibir conexiones");
    });

    // Configurar timeout para el servidor
    server.timeout = 60000;
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on("SIGINT", () => {
  console.log("\n🛑 Cerrando servidor...");
  database.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Cerrando servidor...");
  database.close();
  process.exit(0);
});

// Iniciar servidor
startServer();

export default app;
