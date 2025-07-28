import { useState, useEffect } from "react";
import {
  IncidentReport,
  CreateIncidentData,
  IncidentStatus,
  IncidentPriority,
  IncidentCategory,
} from "@ciudad-activa/types";
import { ApiService, type ApiIncident } from "../services/apiService";

// Helper function to convert API incident to app format
const convertApiIncidentToAppFormat = (
  apiIncident: ApiIncident
): IncidentReport => ({
  id: apiIncident.id,
  type: {
    id: apiIncident.type.id,
    name: apiIncident.type.name,
    icon: apiIncident.type.icon as any,
    color: apiIncident.type.color,
    category: apiIncident.type.category as IncidentCategory,
    description: apiIncident.type.description,
  },
  title: apiIncident.title,
  description: apiIncident.description,
  coordinates: apiIncident.coordinates,
  address: apiIncident.address,
  status: apiIncident.status as IncidentStatus,
  priority: apiIncident.priority as IncidentPriority,
  reportedBy: apiIncident.reportedBy,
  reportedAt: new Date(apiIncident.reportedAt),
  updatedAt: new Date(apiIncident.updatedAt),
  votes: apiIncident.votes,
  views: apiIncident.views,
  photos: apiIncident.photos,
  tags: apiIncident.tags,
});

export function useIncidents() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load incidents from API
  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiIncidents = await ApiService.getIncidents();
      const convertedIncidents = apiIncidents.map(
        convertApiIncidentToAppFormat
      );
      setIncidents(convertedIncidents);
    } catch (err) {
      console.error("Error loading incidents:", err);
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadIncidents();
  }, []);

  const addIncident = async (data: CreateIncidentData): Promise<string> => {
    try {
      setError(null);

      // We need to get the type information from the typeId
      // For now, we'll create a mapping of common types
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
        typeName: typeInfo.name,
        typeIcon: typeInfo.icon,
        typeColor: typeInfo.color,
        typeCategory: typeInfo.category,
        latitude: data.coordinates.lat,
        longitude: data.coordinates.lng,
        address: "", // Will be filled by geocoding if available
        priority: data.priority || "medium",
        reportedBy: "Usuario Web", // Default user
        photos: data.photos || [],
        tags: [], // Default empty tags
      };

      const result = await ApiService.createIncident(apiData);

      // Reload incidents to get the updated list
      await loadIncidents();

      return result.id;
    } catch (err) {
      console.error("Error creating incident:", err);
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

      // TODO: Add API endpoint for updating incident status when backend supports it
      console.log(
        `Status update for incident ${id} to ${status} - API endpoint not yet implemented`
      );
    } catch (err) {
      console.error("Error updating incident status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update incident status"
      );
      // Reload incidents to restore correct state
      await loadIncidents();
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
    } catch (err) {
      console.error("Error voting on incident:", err);
      setError(
        err instanceof Error ? err.message : "Failed to vote on incident"
      );
      // Reload incidents to restore correct state
      await loadIncidents();
    }
  };

  const refreshIncidents = async (): Promise<void> => {
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
