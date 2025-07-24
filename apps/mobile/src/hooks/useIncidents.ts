import { useState, useEffect } from "react";
import {
  IncidentReport,
  CreateIncidentData,
  IncidentStatus,
  IncidentPriority,
  IncidentCategory,
} from "@ciudad-activa/types";

// Datos de ejemplo para la app móvil
const EXAMPLE_INCIDENTS: IncidentReport[] = [
  {
    id: "1",
    type: {
      id: "waste-garbage",
      name: "Basura acumulada",
      icon: "🗑️",
      color: "#ef4444",
      category: IncidentCategory.WASTE,
      description: "Acumulación de basura en espacios públicos",
    },
    title: "Basura acumulada en parque central",
    description: "Gran cantidad de desechos en la entrada del parque",
    coordinates: { lat: 25.6866, lng: -100.3161 }, // Monterrey
    address: "Centro de Monterrey, Nuevo León",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: IncidentStatus.REPORTED,
    priority: IncidentPriority.MEDIUM,
    photos: [],
    tags: ["basura", "parque"],
    upvotes: 12,
    downvotes: 1,
    comments: [],
  },
  {
    id: "2",
    type: {
      id: "road-pothole",
      name: "Bache",
      icon: "🕳️",
      color: "#f59e0b",
      category: IncidentCategory.INFRASTRUCTURE,
      description: "Baches y deterioro en calles",
    },
    title: "Bache profundo en avenida principal",
    description: "Bache de gran tamaño que dificulta el tránsito vehicular",
    coordinates: { lat: 25.6792, lng: -100.3103 },
    address: "Av. Constitución, Monterrey",
    reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: IncidentStatus.IN_PROGRESS,
    priority: IncidentPriority.HIGH,
    photos: [],
    tags: ["bache", "vialidad"],
    upvotes: 24,
    downvotes: 2,
    comments: [],
  },
  {
    id: "3",
    type: {
      id: "lighting-streetlight",
      name: "Alumbrado público",
      icon: "💡",
      color: "#3b82f6",
      category: IncidentCategory.UTILITIES,
      description: "Problemas con el alumbrado público",
    },
    title: "Lámpara de calle fundida",
    description: "Luminaria no funciona desde hace varios días",
    coordinates: { lat: 25.6943, lng: -100.3234 },
    address: "Col. Centro, Monterrey",
    reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: IncidentStatus.REPORTED,
    priority: IncidentPriority.MEDIUM,
    photos: [],
    tags: ["alumbrado", "seguridad"],
    upvotes: 8,
    downvotes: 0,
    comments: [],
  },
  {
    id: "4",
    type: {
      id: "traffic-signal",
      name: "Semáforo",
      icon: "🚦",
      color: "#22c55e",
      category: IncidentCategory.TRAFFIC,
      description: "Problemas con semáforos",
    },
    title: "Semáforo intermitente",
    description: "El semáforo solo parpadea en amarillo, causando confusión",
    coordinates: { lat: 25.6889, lng: -100.319 },
    address: "Cruce Av. Hidalgo y Morelos",
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: IncidentStatus.REPORTED,
    priority: IncidentPriority.HIGH,
    photos: [],
    tags: ["semáforo", "tráfico"],
    upvotes: 35,
    downvotes: 3,
    comments: [],
  },
];

const INCIDENT_TYPES = [
  { id: "bache", name: "Baches", color: "#ef4444", icon: "🕳️" },
  { id: "alumbrado", name: "Alumbrado", color: "#f59e0b", icon: "💡" },
  { id: "basura", name: "Basura", color: "#22c55e", icon: "🗑️" },
  { id: "semaforo", name: "Semáforos", color: "#3b82f6", icon: "🚦" },
  { id: "agua", name: "Agua", color: "#06b6d4", icon: "💧" },
  { id: "vialidad", name: "Vialidad", color: "#8b5cf6", icon: "🚧" },
];

export const useIncidents = () => {
  const [incidents, setIncidents] =
    useState<IncidentReport[]>(EXAMPLE_INCIDENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular carga inicial
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const createIncident = async (
    data: CreateIncidentData
  ): Promise<IncidentReport> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de la API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newIncident: IncidentReport = {
        id: Date.now().toString(),
        type: data.type,
        title: `${data.type.name} reportado`,
        description: data.description,
        coordinates: data.coordinates,
        address: `Lat: ${data.coordinates.lat.toFixed(4)}, Lng: ${data.coordinates.lng.toFixed(4)}`,
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: IncidentStatus.REPORTED,
        priority: data.priority,
        photos: [],
        tags: [data.type.id],
        upvotes: 0,
        downvotes: 0,
        comments: [],
      };

      setIncidents((prev) => [newIncident, ...prev]);
      return newIncident;
    } catch (err) {
      const errorMessage = "Error al crear el incidente";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateIncident = async (
    id: string,
    updates: Partial<IncidentReport>
  ): Promise<IncidentReport> => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedIncident = incidents.find((inc) => inc.id === id);
      if (!updatedIncident) {
        throw new Error("Incidente no encontrado");
      }

      const newIncident = {
        ...updatedIncident,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? newIncident : inc))
      );
      return newIncident;
    } catch (err) {
      const errorMessage = "Error al actualizar el incidente";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIncident = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIncidents((prev) => prev.filter((inc) => inc.id !== id));
    } catch (err) {
      const errorMessage = "Error al eliminar el incidente";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getIncidentById = (id: string): IncidentReport | undefined => {
    return incidents.find((incident) => incident.id === id);
  };

  const getIncidentsByType = (typeId: string): IncidentReport[] => {
    return incidents.filter((incident) => incident.type.id === typeId);
  };

  const getIncidentsByStatus = (status: IncidentStatus): IncidentReport[] => {
    return incidents.filter((incident) => incident.status === status);
  };

  const getIncidentsByPriority = (
    priority: IncidentPriority
  ): IncidentReport[] => {
    return incidents.filter((incident) => incident.priority === priority);
  };

  const upvoteIncident = async (id: string): Promise<void> => {
    const incident = incidents.find((inc) => inc.id === id);
    if (incident) {
      await updateIncident(id, { upvotes: incident.upvotes + 1 });
    }
  };

  const downvoteIncident = async (id: string): Promise<void> => {
    const incident = incidents.find((inc) => inc.id === id);
    if (incident) {
      await updateIncident(id, { downvotes: incident.downvotes + 1 });
    }
  };

  const getIncidentStats = () => {
    const total = incidents.length;
    const reported = incidents.filter(
      (inc) => inc.status === IncidentStatus.REPORTED
    ).length;
    const inProgress = incidents.filter(
      (inc) => inc.status === IncidentStatus.IN_PROGRESS
    ).length;
    const resolved = incidents.filter(
      (inc) => inc.status === IncidentStatus.RESOLVED
    ).length;

    const byType = INCIDENT_TYPES.map((type) => ({
      type: type.name,
      count: incidents.filter((inc) => inc.type.id === type.id).length,
      color: type.color,
    }));

    return {
      total,
      reported,
      inProgress,
      resolved,
      byType,
    };
  };

  return {
    incidents,
    isLoading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
    getIncidentById,
    getIncidentsByType,
    getIncidentsByStatus,
    getIncidentsByPriority,
    upvoteIncident,
    downvoteIncident,
    getIncidentStats,
  };
};
