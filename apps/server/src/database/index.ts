import { Database as SQLiteDatabase } from "sqlite3";
import * as path from "path";

export class Database {
  private db: SQLiteDatabase | null = null;

  initialize() {
    const dbPath =
      process.env.DATABASE_PATH ||
      path.join(__dirname, "../../database.sqlite");

    this.db = new SQLiteDatabase(dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err);
        throw err;
      }
      console.log("Connected to SQLite database");
    });

    this.createTables();
    this.insertInitialData();
  }

  getDb(): SQLiteDatabase {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error("Error closing database:", err);
        } else {
          console.log("Database connection closed");
        }
      });
    }
  }

  private createTables() {
    if (!this.db) return;

    // Tabla de incidentes
    this.db.run(`
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        type_id TEXT NOT NULL,
        type_name TEXT NOT NULL,
        type_icon TEXT NOT NULL,
        type_color TEXT NOT NULL,
        type_category TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        reported_by TEXT,
        reported_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        votes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        photos TEXT,
        tags TEXT
      )
    `);

    // Tabla de estadísticas
    this.db.run(`
      CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY,
        total_incidents INTEGER DEFAULT 0,
        pending_incidents INTEGER DEFAULT 0,
        in_progress_incidents INTEGER DEFAULT 0,
        resolved_incidents INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de notificaciones
    this.db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        incident_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        read_at TEXT,
        FOREIGN KEY (incident_id) REFERENCES incidents (id)
      )
    `);
  }

  private insertInitialData() {
    if (!this.db) return;

    // Insertar estadísticas iniciales
    this.db.run(`
      INSERT OR IGNORE INTO statistics (id, total_incidents, pending_incidents, in_progress_incidents, resolved_incidents)
      VALUES (1, 0, 0, 0, 0)
    `);
  }
}

export const database = new Database();
