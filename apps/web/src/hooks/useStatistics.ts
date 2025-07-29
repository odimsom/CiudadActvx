import { useState, useEffect } from "react";
import { ApiService, type ApiStatistics } from "../services/apiService";

export interface StatisticsData {
  totalIncidents: number;
  pendingIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  updatedAt: string;
}

// Converter function
const convertApiStatisticsToAppFormat = (
  apiStats: ApiStatistics
): StatisticsData => {
  return {
    totalIncidents: apiStats.total_incidents,
    pendingIncidents: apiStats.pending_incidents,
    inProgressIncidents: apiStats.in_progress_incidents,
    resolvedIncidents: apiStats.resolved_incidents,
    updatedAt: apiStats.updated_at,
  };
};

export const useStatistics = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📊 useStatistics: Cargando estadísticas...");

      const apiStatistics = await ApiService.getStatistics();
      console.log("📊 Estadísticas recibidas:", apiStatistics);

      const convertedStatistics =
        convertApiStatisticsToAppFormat(apiStatistics);
      setStatistics(convertedStatistics);
    } catch (err) {
      console.error("❌ useStatistics: Error loading statistics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();

    // Recargar estadísticas cada 5 minutos
    const intervalId = setInterval(loadStatistics, 300000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    statistics,
    loading,
    error,
    loadStatistics,
  };
};
