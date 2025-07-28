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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ id: string; marker: mapboxgl.Marker }[]>([]);

  const { viewport, isLoaded, mapboxToken } = useMapbox();
  const { incidents, addIncident } = useIncidents();

  const [mostrarHeatmap, setMostrarHeatmap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const pressTimer = useRef<number | null>(null);
  const initialPosition = useRef<{ x: number; y: number } | null>(null);

  const getMapStyle = () =>
    mostrarHeatmap
      ? 'mapbox://styles/mapbox/light-v11'
      : 'mapbox://styles/mapbox/streets-v12';

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

    return () => map.current?.remove();
  }, [isLoaded, mapboxToken, viewport]);

  const loadIncidentsOnMap = useCallback(() => {
    if (!map.current) return;
    const mapRef = map.current;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    incidents.forEach((incident: IncidentReport) => {
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
    if (mapRef.getLayer('heatmap-incidencias')) mapRef.removeLayer('heatmap-incidencias');
    if (mapRef.getSource('incidencias-heatmap')) mapRef.removeSource('incidencias-heatmap');

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
    } else if (map.current) {
      if (map.current.getLayer('heatmap-incidencias')) map.current.removeLayer('heatmap-incidencias');
      if (map.current.getSource('incidencias-heatmap')) map.current.removeSource('incidencias-heatmap');
    }
  }, [mostrarHeatmap, applyHeatmapLayer]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const timeout = window.setTimeout(() => {
      if (!map.current) return;
      const lngLat = map.current.unproject([e.clientX, e.clientY]);
      setSelectedCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
      setIsFormModalOpen(true);
    }, 500);
    pressTimer.current = timeout;
    initialPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
    initialPosition.current = null;
  };

  return (
    <motion.div
      className={`relative ${className}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
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
