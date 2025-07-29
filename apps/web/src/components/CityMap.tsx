import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapbox } from '@ciudad-activa/maps';
import { Coordinates, IncidentReport, CreateIncidentData } from '@ciudad-activa/types';
import { IncidentFormModal } from './IncidentFormModal';
import { MapLegend } from './MapLegend';
import { IncidentDetailsPanel } from './IncidentDetailsPanel';
import { RealtimeNotifications } from './RealtimeNotifications';
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
  const markersRef = useRef<{ id: string; marker: mapboxgl.Marker }[]>([]);

  const { viewport, isLoaded, mapboxToken } = useMapbox();
  const { incidents, addIncident } = useIncidents();
  
  console.log("🗺️ CityMap: Incidents obtenidos del hook:", incidents);

  const [mostrarHeatmap, setMostrarHeatmap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [clickRipples, setClickRipples] = useState<{ id: string; x: number; y: number; lng: number; lat: number }[]>([]);

  const getMapStyle = () =>
    mostrarHeatmap
      ? 'mapbox://styles/mapbox/light-v11'
      : 'mapbox://styles/mapbox/streets-v12';

  // Obtener ubicación actual del usuario
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Centrar el mapa en la ubicación del usuario
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            duration: 1500
          });
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, []);

  // Manejar click en el mapa
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    const { lngLat, point } = e;
    
    // Crear efecto de onda
    const rippleId = Date.now().toString();
    const newRipple = {
      id: rippleId,
      x: point.x,
      y: point.y,
      lng: lngLat.lng,
      lat: lngLat.lat
    };
    
    setClickRipples(prev => [...prev, newRipple]);
    
    // Remover la onda después de la animación
    setTimeout(() => {
      setClickRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
    }, 1000);
    
    // Configurar coordenadas para el formulario
    setSelectedCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
    setIsFormModalOpen(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(),
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
        coordinates: incident.coordinates,
        type: incident.type.name,
        color: incident.type.color
      });

      const el = document.createElement('div');
      el.className = 'incident-marker';
      el.style.cssText = `
        width: 22px;
        height: 22px;
        background: ${incident.type.color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class='text-sm'>
            <strong>${incident.type.name}</strong>
            <p>${incident.description || 'Sin descripción'}</p>
            <small>${new Date(incident.reportedAt).toLocaleDateString('es-ES')}</small>
          </div>
        `))
        .addTo(mapRef);

      markersRef.current.push({ id: incident.id, marker });
    });
    
    console.log("🗺️ loadIncidentsOnMap: Marcadores creados:", markersRef.current.length);
  }, [incidents]);

  // BLOQUE HEATMAP MODIFICADO:
  const applyHeatmapLayer = useCallback(() => {
    if (!map.current) return;

    const mapRef = map.current;
    const geojsonData: FeatureCollection = {
      type: 'FeatureCollection',
      features: incidents.map((i: IncidentReport) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [i.coordinates.lng, i.coordinates.lat],
        },
        properties: {},
      })),
    };

    // Eliminar capas/sources previos
    try {
      if (mapRef.getLayer('heatmap-incidencias')) mapRef.removeLayer('heatmap-incidencias');
      if (mapRef.getSource('incidencias-heatmap')) mapRef.removeSource('incidencias-heatmap');
    } catch (error) {
      console.warn('Error removing previous heatmap layers:', error);
    }

    mapRef.addSource('incidencias-heatmap', {
      type: 'geojson',
      data: geojsonData,
    });

    mapRef.addLayer({
      id: 'heatmap-incidencias',
      type: 'heatmap',
      source: 'incidencias-heatmap',
      maxzoom: 17,
      paint: {
        // Radio escala con el zoom, para mantener densidad visual
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 18,
          10, 34,
          15, 64,
        ],
        // Intensidad crece con zoom
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0.8,
          10, 2,
          15, 6
        ],
        // Opacidad alta
        'heatmap-opacity': 0.85,
        // Peso fijo
        'heatmap-weight': 1,
        // Gradiente: azul-verde-amarillo-rojo clásico
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,255,0)',         // azul transparente
          0.1, 'rgba(0,0,255,0.8)',     // azul
          0.3, 'rgba(0,255,255,0.8)',   // cian
          0.5, 'rgba(0,255,0,0.8)',     // verde
          0.7, 'rgba(255,255,0,0.8)',   // amarillo
          0.9, 'rgba(255,140,0,0.9)',   // naranja
          1, 'rgba(255,0,0,1)'          // rojo fuerte
        ]
      },
    });
  }, [incidents]);
  // -----

  useEffect(() => {
    if (mostrarHeatmap) {
      applyHeatmapLayer();
    } else if (map.current && map.current.isStyleLoaded()) {
      try {
        if (map.current.getLayer('heatmap-incidencias')) {
          map.current.removeLayer('heatmap-incidencias');
        }
        if (map.current.getSource('incidencias-heatmap')) {
          map.current.removeSource('incidencias-heatmap');
        }
      } catch (error) {
        console.warn('Error removing heatmap layers:', error);
      }
    }
  }, [mostrarHeatmap, applyHeatmapLayer]);

  // Cargar incidents en el mapa cuando cambien
  useEffect(() => {
    console.log("🗺️ useEffect incidents: Detectado cambio en incidents, total:", incidents.length);
    if (map.current && map.current.isStyleLoaded()) {
      loadIncidentsOnMap();
    }
  }, [incidents, loadIncidentsOnMap]);

  // Removed old pointer handlers for new click-based interaction

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ touchAction: 'pan-x pan-y' }}
    >
      <AppHeader
        incidentCount={incidents.length}
        mostrarHeatmap={mostrarHeatmap}
        onToggleHeatmap={() => setMostrarHeatmap(prev => !prev)}
      />

      <div ref={mapContainer} className="h-full w-full" />

      {selectedCoordinates && (
        <IncidentFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedCoordinates(null);
          }}
          onSubmit={async (data: CreateIncidentData) => {
            await addIncident(data);
            setIsFormModalOpen(false);
            setSelectedCoordinates(null);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
          }}
          coordinates={selectedCoordinates}
        />
      )}

      <MapLegend />

      <IncidentDetailsPanel
        incident={selectedIncident}
        isOpen={isDetailsPanelOpen}
        onClose={() => {
          setIsDetailsPanelOpen(false);
          setSelectedIncident(null);
        }}
      />

      {/* Click Ripples */}
      {clickRipples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none z-40"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onAnimationComplete={() => {
            setClickRipples(prev => prev.filter(r => r.id !== ripple.id));
          }}
        >
          <div className="w-full h-full rounded-full bg-blue-500/30 border-2 border-blue-500/50" />
        </motion.div>
      ))}

      {/* User Location Button */}
      <button
        onClick={getCurrentLocation}
        className="absolute top-20 right-4 z-50 bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50 transition-colors"
        title="Mi ubicación"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-gray-700" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Notificaciones en tiempo real */}
      <RealtimeNotifications />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            ¡Gracias por ayudar a mejorar tu comunidad! 💙
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
