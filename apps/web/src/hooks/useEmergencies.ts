import { useState, useEffect } from "react";

// Tipos locales para emergencias
export enum EmergencyType {
  FLOOD = "flood",
  EARTHQUAKE = "earthquake",
  FIRE = "fire",
  HURRICANE = "hurricane",
  OTHER = "other",
}

export enum EmergencyStatus {
  ACTIVE = "active",
  MONITORING = "monitoring",
  RESOLVED = "resolved",
}

export enum EmergencyPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface CreateEmergencyData {
  type: EmergencyType;
  title?: string;
  description?: string;
  province: string;
  municipality?: string;
  latitude?: number;
  longitude?: number;
  priority?: EmergencyPriority;
  reportedBy?: string;
  imageUrl?: string;
  affectedPeople?: number;
  estimatedDamage?: string;
}

export interface Emergency {
  id: string;
  type: EmergencyType;
  title: string;
  description?: string;
  province: string;
  municipality?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: EmergencyStatus;
  priority: EmergencyPriority;
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  imageUrl?: string;
  affectedPeople?: number;
  estimatedDamage?: string;
  response?: string;
  isPublic: boolean;
}

export interface EmergencyStats {
  total: number;
  active: number;
  resolved: number;
  monitoring: number;
  byType: Record<string, number>;
  byProvince: Record<string, number>;
  last24Hours: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export function useEmergencies() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/emergencies`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Convertir fechas de string a Date
      const emergenciesWithDates = data.map((emergency: any) => ({
        ...emergency,
        reportedAt: new Date(emergency.reportedAt),
        updatedAt: new Date(emergency.updatedAt),
        resolvedAt: emergency.resolvedAt
          ? new Date(emergency.resolvedAt)
          : undefined,
      }));

      setEmergencies(emergenciesWithDates);
      setError(null);
    } catch (err) {
      console.error("Error fetching emergencies:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setEmergencies([]);
    } finally {
      setLoading(false);
    }
  };

  const createEmergency = async (
    emergencyData: CreateEmergencyData
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emergencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emergencyData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }

      await response.json();

      // Refrescar la lista de emergencias
      await fetchEmergencies();

      return true;
    } catch (err) {
      console.error("Error creating emergency:", err);
      setError(
        err instanceof Error ? err.message : "Error al crear emergencia"
      );
      return false;
    }
  };

  const updateEmergencyStatus = async (
    emergencyId: string,
    status: EmergencyStatus,
    response?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/emergencies/${emergencyId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, response }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP: ${res.status}`);
      }

      // Refrescar la lista de emergencias
      await fetchEmergencies();

      return true;
    } catch (err) {
      console.error("Error updating emergency status:", err);
      setError(
        err instanceof Error ? err.message : "Error al actualizar emergencia"
      );
      return false;
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  return {
    emergencies,
    loading,
    error,
    refetch: fetchEmergencies,
    createEmergency,
    updateEmergencyStatus,
  };
}

export function useEmergencyStats() {
  const [stats, setStats] = useState<EmergencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/emergencies/stats`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching emergency stats:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
