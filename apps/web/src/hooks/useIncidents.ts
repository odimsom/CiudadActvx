import { useState, useEffect } from "react";
import {
  IncidentReport,
  CreateIncidentData,
  IncidentStatus,
} from "@ciudad-activa/types";
import { ApiService } from "../services/apiService";

// Cache global para evitar múltiples cargas simultáneas
let globalIncidentsCache: IncidentReport[] | null = null;
let globalCacheTimestamp: number = 0;
let activeLoadPromise: Promise<IncidentReport[]> | null = null;
const CACHE_DURATION = 60000; // 1 minuto para reducir rate limiting (in-memory)
const LS_CACHE_KEY = "ciudadactiva_incidents_cache_v1";
const LS_CACHE_TS_KEY = "ciudadactiva_incidents_cache_ts_v1";
const LS_MAX_AGE = 1000 * 60 * 60 * 24; // 24h persistente

export function useIncidents() {
  console.log("🎯 useIncidents: Hook inicializado");

  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    // Inicializar con caché si está disponible y es reciente
    if (
      globalIncidentsCache &&
      Date.now() - globalCacheTimestamp < CACHE_DURATION
    ) {
      console.log("🔄 useIncidents: Usando datos del caché global inicial");
      return globalIncidentsCache;
    }
    // Intentar con caché persistente en localStorage
    try {
      const raw = localStorage.getItem(LS_CACHE_KEY);
      const tsRaw = localStorage.getItem(LS_CACHE_TS_KEY);
      if (raw && tsRaw) {
        const ts = Number(tsRaw);
        if (!isNaN(ts) && Date.now() - ts < LS_MAX_AGE) {
          const parsed = JSON.parse(raw) as IncidentReport[];
          console.log(
            "💾 useIncidents: Cargando caché persistente (localStorage)"
          );
          globalIncidentsCache = parsed;
          globalCacheTimestamp = Date.now();
          return parsed;
        }
      }
    } catch {}
    return [];
  });

  const [loading, setLoading] = useState(!globalIncidentsCache);
  const [error, setError] = useState<string | null>(null);

  // Load incidents from API with smart caching and deduplication
  const loadIncidents = async (): Promise<void> => {
    try {
      console.log("🔄 useIncidents: Verificando necesidad de carga...");

      // Si hay datos en caché recientes, usarlos
      if (
        globalIncidentsCache &&
        Date.now() - globalCacheTimestamp < CACHE_DURATION
      ) {
        console.log("✅ useIncidents: Usando datos del caché (aún válidos)");
        setIncidents(globalIncidentsCache);
        setLoading(false);
        setError(null);
        return;
      }

      // Si ya hay una carga en progreso, esperarla
      if (activeLoadPromise) {
        console.log("⏳ useIncidents: Esperando carga en progreso...");
        try {
          const cachedData = await activeLoadPromise;
          setIncidents(cachedData);
          setLoading(false);
          setError(null);
          return;
        } catch (err) {
          console.log(
            "❌ useIncidents: Error en carga en progreso, continuando..."
          );
        }
      }

      console.log("🔄 useIncidents: Iniciando carga fresca desde API...");
      setLoading(true);
      setError(null);

      // Crear promesa de carga global para deduplicar llamadas
      activeLoadPromise = (async () => {
        const apiIncidents = await ApiService.getIncidents();
        console.log(
          `📊 useIncidents: ${apiIncidents.length} incidentes recibidos de la API`
        );

        // Convertir los datos de la API al formato de la app
        const convertedIncidents: IncidentReport[] = apiIncidents.map(
          (apiIncident: any) => {
            // Normalizar coordenadas desde múltiples posibles campos
            const lat =
              apiIncident.coordinates?.lat ??
              apiIncident.latitude ??
              apiIncident.lat ??
              0;
            const lng =
              apiIncident.coordinates?.lng ??
              apiIncident.longitude ??
              apiIncident.lng ??
              0;
            return {
              id: apiIncident.id,
              type: {
                id: apiIncident.type?.id || "unknown",
                name: apiIncident.type?.name || "Incidencia",
                icon: apiIncident.type?.icon || "AlertTriangle",
                color: apiIncident.type?.color || "#6b7280",
                category: apiIncident.type?.category || "other",
                description: apiIncident.type?.description || "",
              },
              title: apiIncident.title || "Sin título",
              description: apiIncident.description || "",
              coordinates: { lat, lng },
              address: apiIncident.address || "",
              status: apiIncident.status || "pending",
              priority: apiIncident.priority || "medium",
              reportedBy: apiIncident.reported_by || "Usuario anónimo",
              reportedAt: new Date(apiIncident.reported_at || Date.now()),
              updatedAt: apiIncident.updated_at
                ? new Date(apiIncident.updated_at)
                : new Date(),
              photos: apiIncident.photos || [],
              images:
                apiIncident.images?.map((img: any) => ({
                  id: img.id,
                  url: img.url,
                  alt: img.alt || "Imagen de incidencia",
                })) || [],
              votes: apiIncident.votes || 0,
              views: apiIncident.views || 0,
              notes: apiIncident.notes || [],
            };
          }
        );

        // Actualizar caché global
        globalIncidentsCache = convertedIncidents;
        globalCacheTimestamp = Date.now();

        console.log("✅ useIncidents: Datos almacenados en caché global");
        // Guardar caché persistente
        try {
          localStorage.setItem(
            LS_CACHE_KEY,
            JSON.stringify(convertedIncidents)
          );
          localStorage.setItem(LS_CACHE_TS_KEY, String(Date.now()));
        } catch {}
        return convertedIncidents;
      })();

      const result = await activeLoadPromise;
      setIncidents(result);
    } catch (err) {
      console.error("❌ useIncidents: Error loading incidents:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load incidents";
      setError(errorMessage);

      // Si tenemos datos en caché aunque sean antiguos, usarlos como fallback
      if (globalIncidentsCache) {
        console.log(
          "🔄 useIncidents: Usando caché como fallback debido a error"
        );
        setIncidents(globalIncidentsCache);
        setError(`${errorMessage} (mostrando datos del caché)`);
      } else {
        // Intentar usar caché persistente si existe
        try {
          const raw = localStorage.getItem(LS_CACHE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as IncidentReport[];
            console.log(
              "💾 useIncidents: Usando caché persistente como fallback"
            );
            setIncidents(parsed);
          }
        } catch {}
      }
    } finally {
      setLoading(false);
      activeLoadPromise = null; // Limpiar promesa activa
      console.log("🔚 useIncidents: Carga completada");
    }
  };

  // Initial load con debouncing
  useEffect(() => {
    console.log("🔄 useIncidents: useEffect ejecutándose...");

    // Si ya tenemos datos del caché, no necesitamos cargar inmediatamente
    if (
      globalIncidentsCache &&
      Date.now() - globalCacheTimestamp < CACHE_DURATION
    ) {
      console.log(
        "✅ useIncidents: Saltando carga inicial, datos en caché válidos"
      );
      return;
    }

    // Pequeña demora para permitir que múltiples instancias del hook se inicialicen
    const timeoutId = setTimeout(() => {
      loadIncidents().finally(() => {
        // Señal global para que otras cargas esperen a incidentes primero
        try {
          (window as any).__incidentsFirstLoadDone = true;
        } catch {}
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const addIncident = async (data: CreateIncidentData): Promise<string> => {
    try {
      console.log("🔄 useIncidents: Iniciando creación de incidente...", data);
      setError(null);

      // Mapping de tipos comunes
      const typeMapping: Record<
        string,
        { name: string; icon: string; color: string; category: string }
      > = {
        "waste-garbage": {
          name: "Basura acumulada",
          icon: "Trash2",
          color: "#ef4444",
          category: "waste",
        },
        "roads-pothole": {
          name: "Bache en la vía",
          icon: "Construction",
          color: "#f59e0b",
          category: "infrastructure",
        },
        "lighting-broken": {
          name: "Alumbrado dañado",
          icon: "Lightbulb",
          color: "#8b5cf6",
          category: "infrastructure",
        },
        "water-leak": {
          name: "Fuga de agua",
          icon: "Droplets",
          color: "#3b82f6",
          category: "infrastructure",
        },
        "safety-vandalism": {
          name: "Vandalismo",
          icon: "Shield",
          color: "#dc2626",
          category: "safety",
        },
      };

      const typeInfo = typeMapping[data.typeId] || {
        name: "Incidencia",
        icon: "AlertTriangle",
        color: "#6b7280",
        category: "other",
      };

      const apiData = {
        title: data.title,
        description: data.description,
        typeId: data.typeId,
        typeName: data.typeName || typeInfo.name,
        typeIcon: data.typeIcon || typeInfo.icon,
        typeColor: data.typeColor || typeInfo.color,
        typeCategory: data.typeCategory || typeInfo.category,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || "",
        priority: data.priority || "medium",
        reportedBy: data.reportedBy || "Usuario Web",
        photos: data.photos || [],
        tags: [],
      };

      console.log("📤 useIncidents: Enviando datos a API:", apiData);
      const result = await ApiService.createIncident(apiData);
      console.log("✅ useIncidents: Incidente creado exitosamente:", result);

      // Invalidar caché para forzar recarga
      globalIncidentsCache = null;
      globalCacheTimestamp = 0;

      // Recargar incidents para obtener el nuevo
      console.log("🔄 useIncidents: Recargando lista de incidentes...");
      await loadIncidents();

      return result.id;
    } catch (err) {
      console.error("❌ useIncidents: Error creating incident:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create incident";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateIncidentStatus = async (
    id: string,
    status: IncidentStatus
  ): Promise<void> => {
    try {
      setError(null);
      // Update local state optimistically
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === id
            ? { ...incident, status, updatedAt: new Date() }
            : incident
        )
      );

      // Invalidar caché
      if (globalIncidentsCache) {
        globalIncidentsCache = globalIncidentsCache.map((incident) =>
          incident.id === id
            ? { ...incident, status, updatedAt: new Date() }
            : incident
        );
      }

      console.log(
        `Status update for incident ${id} to ${status} - API endpoint not yet implemented`
      );
    } catch (err) {
      console.error("Error updating incident status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update incident status"
      );
      await loadIncidents(); // Restore correct state
    }
  };

  const voteOnIncident = async (
    id: string,
    action: "up" | "down"
  ): Promise<void> => {
    try {
      setError(null);

      // Update local state optimistically
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === id
            ? {
                ...incident,
                votes: (incident.votes || 0) + (action === "up" ? 1 : -1),
                updatedAt: new Date(),
              }
            : incident
        )
      );

      await ApiService.voteIncident(id, action);

      // Invalidar caché parcialmente
      if (globalIncidentsCache) {
        globalIncidentsCache = globalIncidentsCache.map((incident) =>
          incident.id === id
            ? {
                ...incident,
                votes: (incident.votes || 0) + (action === "up" ? 1 : -1),
                updatedAt: new Date(),
              }
            : incident
        );
      }
    } catch (err) {
      console.error("Error voting on incident:", err);
      setError(
        err instanceof Error ? err.message : "Failed to vote on incident"
      );
      await loadIncidents(); // Restore correct state
    }
  };

  const refreshIncidents = async (): Promise<void> => {
    // Invalidar caché y forzar recarga
    globalIncidentsCache = null;
    globalCacheTimestamp = 0;
    await loadIncidents();
  };

  return {
    incidents,
    loading,
    error,
    addIncident,
    updateIncidentStatus,
    voteOnIncident,
    refreshIncidents,
  };
}
