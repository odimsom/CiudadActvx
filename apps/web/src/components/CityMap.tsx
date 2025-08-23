import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapbox } from '@ciudad-activa/maps';
import { Coordinates, IncidentReport, CreateIncidentData } from '@ciudad-activa/types';
import { IncidentFormModal } from './IncidentFormModal';
import { MapLegend } from './MapLegend';
import { IncidentDetailsPanel } from './IncidentDetailsPanel';
import { ImprovedLoadingState } from './ImprovedLoadingState';
import { useToast } from './ToastManager';
import { SubmissionStatus } from './SubmissionStatus';
import { useIncidents } from '../hooks/useIncidents';
import { AppHeader } from './AppHeader';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CityMapProps {
  className?: string;
}

export const CityMap: React.FC<CityMapProps> = ({ className }) => {
  console.log("🗺️ CityMap: Componente renderizado/montado");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Array<{ marker: mapboxgl.Marker; id: string }>>([]);

  const { incidents, addIncident } = useIncidents();
  const { mapboxToken, viewport, isLoaded } = useMapbox();
  const { showSuccess, showError, showInfo, ToastManager } = useToast();
  
  const [mostrarHeatmap, setMostrarHeatmap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [mostrarToast, ] = useState(false);
  
  // Estados para el sistema de envío mejorado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    console.log("🗺️ Map click detected:", e.lngLat);
    const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    setSelectedCoordinates(coords);
    setIsFormModalOpen(true);
    
    // Mostrar toast informativo
    showInfo('📍 Ubicación seleccionada', 'Completa el formulario para reportar el problema');
  }, [showInfo]);

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || map.current) return;
    
    // Verificar que el contenedor del mapa esté disponible
    if (!mapContainer.current || !mapContainer.current.isConnected) {
      console.warn("🗺️ Contenedor del mapa no está disponible");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    try {
      console.log("🗺️ Inicializando mapa...");
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [viewport.center.lng, viewport.center.lat],
        zoom: viewport.zoom
      });

      map.current.on('load', () => {
        console.log("🗺️ Mapa cargado completamente");
        // Esperamos un poco para asegurar que todo esté listo
        setTimeout(() => {
          loadIncidentsOnMap();
        }, 100);
      });

      map.current.on('click', handleMapClick);

      console.log("🗺️ Mapa inicializado exitosamente");
    } catch (error) {
      console.error("🗺️ Error al inicializar mapa:", error);
      return;
    }

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
        map.current = null;
      }
    };
  }, [isLoaded, mapboxToken, viewport, handleMapClick]);

  const loadIncidentsOnMap = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) {
      console.warn("🗺️ Mapa no está listo para cargar marcadores");
      return;
    }
    
    console.log("🗺️ Cargando incidentes en mapa, total:", incidents.length);

    // Limpiar marcadores existentes
    markersRef.current.forEach(({ marker }) => {
      try {
        marker.remove();
      } catch (error) {
        console.warn("🗺️ Error al remover marcador:", error);
      }
    });
    markersRef.current = [];

    incidents.forEach((incident: IncidentReport, index) => {
      console.log(`🔴 Marcador ${index + 1}:`, {
        id: incident.id,
        color: incident.type.color,
        category: incident.type.category
      });

      const el = document.createElement('div');
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${incident.type.color || '#6b7280'};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      `;
      el.innerHTML = (index + 1).toString();

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedIncident(incident);
        setIsDetailsPanelOpen(true);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([incident.coordinates.lng, incident.coordinates.lat]);

      // Verificar que el mapa esté completamente disponible antes de añadir el marcador
      if (map.current && map.current.getContainer() && map.current.isStyleLoaded()) {
        try {
          marker.addTo(map.current);
          markersRef.current.push({ marker, id: incident.id });
          console.log(`✅ Marcador ${index + 1} añadido exitosamente`);
        } catch (error) {
          console.error("🗺️ Error al añadir marcador:", error);
        }
      } else {
        console.warn(`⚠️ No se pudo añadir marcador ${index + 1}: mapa no disponible`);
      }
    });

    console.log("🗺️ Marcadores creados:", markersRef.current.length);
  }, [incidents]);

  const applyHeatmapLayer = useCallback(() => {
    console.log("🔥 Aplicando heatmap...");
    
    if (!map.current || !map.current.isStyleLoaded() || !incidents.length) {
      console.log("🔥 No se puede aplicar heatmap - mapa no listo o sin incidentes");
      return;
    }

    const geojsonData = {
      type: 'FeatureCollection',
      features: incidents.map(incident => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [incident.coordinates.lng, incident.coordinates.lat]
        },
        properties: {
          intensity: incident.priority === 'urgent' ? 3 : 2
        }
      }))
    };

    const sourceId = 'incidents-heatmap';
    const layerId = 'incidents-heatmap-layer';

    try {
      // Remover existentes de forma segura
      if (map.current.getLayer && map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getSource && map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }

      // Agregar nuevos
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData as any
      });

      map.current.addLayer({
        id: layerId,
        type: 'heatmap',
        source: sourceId,
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.8
        }
      });

      console.log("🔥 Heatmap aplicado exitosamente");
    } catch (error) {
      console.error("❌ Error aplicando heatmap:", error);
    }
  }, [incidents]);

  const removeHeatmapLayer = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) {
      console.warn("🗺️ Mapa no está listo para remover heatmap");
      return;
    }
    
    try {
      // Verificar si la capa existe antes de intentar removerla
      if (map.current.getLayer && map.current.getLayer('incidents-heatmap-layer')) {
        map.current.removeLayer('incidents-heatmap-layer');
        console.log("🔥 Capa heatmap removida");
      }
      
      // Verificar si la fuente existe antes de intentar removerla
      if (map.current.getSource && map.current.getSource('incidents-heatmap')) {
        map.current.removeSource('incidents-heatmap');
        console.log("🔥 Fuente heatmap removida");
      }
      
      console.log("🔥 Heatmap removido completamente");
    } catch (error) {
      console.error("❌ Error removiendo heatmap:", error);
    }
  }, []);

  const handleSubmitIncident = async (data: CreateIncidentData) => {
    setIsSubmitting(true);
    setSubmissionSuccess(false);
    setSubmissionError(null);

    try {
      console.log("🔄 Enviando incidente:", data);
      
      // Simular progreso del envío
      await new Promise(resolve => setTimeout(resolve, 4000)); // Tiempo total de animación
      
      await addIncident(data);
      
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setIsFormModalOpen(false);
      setSelectedCoordinates(null);
      
      showSuccess(
        '¡Reporte enviado exitosamente! 🎉',
        'Las autoridades han sido notificadas y procesarán tu reporte en breve',
        {
          label: 'Ver estado',
          onClick: () => console.log('Ver estado del reporte')
        }
      );
      
    } catch (error) {
      console.error("❌ Error al enviar incidente:", error);
      setIsSubmitting(false);
      setSubmissionError('No se pudo enviar el reporte. Verifica tu conexión e intenta nuevamente.');
      
      showError(
        'Error al enviar reporte ❌',
        'Hubo un problema con el envío. Por favor intenta nuevamente.',
        {
          label: 'Reintentar',
          onClick: () => handleSubmitIncident(data)
        }
      );
    }
  };

  const resetSubmissionState = () => {
    setIsSubmitting(false);
    setSubmissionSuccess(false);
    setSubmissionError(null);
  };

  // Progreso de carga simulado
  useEffect(() => {
    if (!isLoaded) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    } else {
      setLoadingProgress(100);
    }
  }, [isLoaded]);

  useEffect(() => {
    // Solo cargar incidentes si el mapa está completamente inicializado
    if (map.current && map.current.isStyleLoaded()) {
      loadIncidentsOnMap();
    }
  }, [incidents, loadIncidentsOnMap]);

  useEffect(() => {
    if (mostrarHeatmap) {
      applyHeatmapLayer();
    } else {
      removeHeatmapLayer();
    }
  }, [mostrarHeatmap, applyHeatmapLayer, removeHeatmapLayer]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative w-full h-full ${className || ''}`}
    >
      {/* Loading state mejorado */}
      <ImprovedLoadingState 
        isLoading={!isLoaded} 
        message="Cargando mapa interactivo..."
        progress={loadingProgress}
      />
      
      {/* Toast Manager para notificaciones */}
      <ToastManager />
      
      {/* Submission status para envío de reportes */}
      <SubmissionStatus
        isSubmitting={isSubmitting}
        isSuccess={submissionSuccess}
        error={submissionError || undefined}
        onReset={resetSubmissionState}
      />

      <AppHeader 
        mostrarHeatmap={mostrarHeatmap}
        onToggleHeatmap={() => setMostrarHeatmap(!mostrarHeatmap)}
      />

      <div ref={mapContainer} className="w-full h-full" />

      <MapLegend />

      {isFormModalOpen && selectedCoordinates && (
        <IncidentFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedCoordinates(null);
          }}
          coordinates={selectedCoordinates}
          onSubmit={handleSubmitIncident}
        />
      )}

      {isDetailsPanelOpen && selectedIncident && (
        <IncidentDetailsPanel
          incident={selectedIncident}
          isOpen={isDetailsPanelOpen}
          onClose={() => {
            setIsDetailsPanelOpen(false);
            setSelectedIncident(null);
          }}
        />
      )}

      <AnimatePresence>
        {mostrarToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            ¡Gracias por ayudar a mejorar tu comunidad! 💙
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
