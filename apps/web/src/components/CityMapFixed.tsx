import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapbox } from '@ciudad-activa/maps';
import { Coordinates, IncidentReport, CreateIncidentData } from '@ciudad-activa/types';
import { IncidentFormModal } from './IncidentFormModal';
import { MapLegend } from './MapLegend';
import { IncidentDetailsPanel } from './IncidentDetailsPanel';
import { useIncidents } from '../hooks/useIncidents';
import { AppHeader } from './AppHeader';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CityMapProps {
  className?: string;
}

export const CityMap: React.FC<CityMapProps> = ({ className }) => {
  console.log("🗺️ CityMap: Componente renderizado/montado");

  // Estados del mapa
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Array<{ marker: mapboxgl.Marker; id: string }>>([]);

  // Estados del componente
  const { incidents, addIncident } = useIncidents();
  const { mapboxToken, viewport, isLoaded, mapStyle } = useMapbox();
  
  const [mostrarHeatmap, setMostrarHeatmap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [mostrarToast, setMostrarToast] = useState(false);

  // Handlers
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    console.log("🗺️ Map click detected:", e.lngLat);
    const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    setSelectedCoordinates(coords);
    setIsFormModalOpen(true);
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!isLoaded || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [viewport.center.lng, viewport.center.lat],
      zoom: viewport.zoom
    });

    map.current.on('load', () => {
      loadIncidentsOnMap();
      if (mostrarHeatmap) applyHeatmapLayer();
    });

    map.current.on('styledata', () => {
      loadIncidentsOnMap();
      if (mostrarHeatmap) applyHeatmapLayer();
    });

    // Agregar listener para clicks en el mapa
    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
      }
    };
  }, [isLoaded, mapboxToken, viewport, handleMapClick, mostrarHeatmap]);

  const loadIncidentsOnMap = useCallback(() => {
    if (!map.current) {
      console.log("🗺️ loadIncidentsOnMap: Map no disponible");
      return;
    }
    
    console.log("🗺️ loadIncidentsOnMap: Cargando incidentes en mapa, total:", incidents.length);
    const mapRef = map.current;

    // Limpiar marcadores existentes
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    incidents.forEach((incident: IncidentReport, index) => {
      console.log(`🗺️ Creando marcador ${index + 1}:`, {
        id: incident.id,
        title: incident.title,
        coordinates: incident.coordinates,
        category: incident.type.category,
        color: incident.type.color,
        fullType: incident.type
      });

      const el = document.createElement('div');
      el.className = 'incident-marker';
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

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedIncident(incident);
        setIsDetailsPanelOpen(true);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
        .addTo(mapRef);

      markersRef.current.push({ marker, id: incident.id });
    });

    console.log("🗺️ Marcadores creados:", markersRef.current.length);
  }, [incidents]);

  const applyHeatmapLayer = useCallback(() => {
    if (!map.current || !incidents.length) return;

    const geojsonData = {
      type: 'FeatureCollection',
      features: incidents.map(incident => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [incident.coordinates.lng, incident.coordinates.lat]
        },
        properties: {
          intensity: incident.priority === 'urgent' ? 3 : incident.priority === 'high' ? 2 : 1
        }
      }))
    };

    const sourceId = 'incidents-heatmap';
    const layerId = 'incidents-heatmap-layer';

    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(layerId);
      map.current.removeSource(sourceId);
    }

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geojsonData as any
    });

    map.current.addLayer({
      id: layerId,
      type: 'heatmap',
      source: sourceId,
      maxzoom: 15,
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
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
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
        'heatmap-opacity': 0.8
      }
    });
  }, [incidents]);

  const handleSubmitIncident = async (data: CreateIncidentData) => {
    try {
      console.log("🔄 CityMap: Enviando incidente:", data);
      await addIncident(data);
      setIsFormModalOpen(false);
      setSelectedCoordinates(null);
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 3000);
    } catch (error) {
      console.error("❌ CityMap: Error al enviar incidente:", error);
    }
  };

  useEffect(() => {
    loadIncidentsOnMap();
  }, [incidents, loadIncidentsOnMap]);

  useEffect(() => {
    if (mostrarHeatmap) {
      applyHeatmapLayer();
    } else if (map.current?.getLayer('incidents-heatmap-layer')) {
      map.current.removeLayer('incidents-heatmap-layer');
      map.current.removeSource('incidents-heatmap');
    }
  }, [mostrarHeatmap, applyHeatmapLayer]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative w-full h-full ${className || ''}`}
    >
      {/* Header de la aplicación */}
      <AppHeader 
        mostrarHeatmap={mostrarHeatmap}
        onToggleHeatmap={() => setMostrarHeatmap(!mostrarHeatmap)}
      />

      {/* Contenedor del mapa */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Leyenda del mapa */}
      <MapLegend />

      {/* Modal de formulario de incidencia */}
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

      {/* Panel de detalles de incidencia */}
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

      {/* Toast de confirmación */}
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
