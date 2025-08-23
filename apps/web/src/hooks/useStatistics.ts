import { useState, useEffect, useRef } from "react";
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
  const isInitialized = useRef(false);

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
    // Evitar dobles ejecuciones en StrictMode
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    // Esperar a que incidentes haga su primera carga para priorizar ese endpoint
    const start = Date.now();
    const maxWaitMs = 10000; // 10s máximo
    const tryStart = () => {
      const done = (window as any).__incidentsFirstLoadDone;
      if (done || Date.now() - start > maxWaitMs) {
        loadStatistics();
      } else {
        setTimeout(tryStart, 300);
      }
    };
    tryStart();

    // Recargar estadísticas cada 10 minutos (reducido para evitar rate limiting)
    const intervalId = setInterval(loadStatistics, 600000);

    return () => {
      clearInterval(intervalId);
      isInitialized.current = false;
    };
  }, []);

  return {
    statistics,
    loading,
    error,
    loadStatistics,
  };
};
