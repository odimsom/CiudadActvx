import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '@ciudad-activa/maps';
import { Coordinates, IncidentReport, CreateIncidentData, IncidentStatus, IncidentPriority } from '@ciudad-activa/types';
import 'mapbox-gl/dist/mapbox-gl.css';

// Hook simplificado para incidentes móviles
const useIncidents = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  
  const addIncident = async (data: CreateIncidentData) => {
    console.log("📱 Agregando incidente móvil:", data);
    // Por ahora solo simular
    const newIncident: IncidentReport = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      coordinates: { lat: data.latitude, lng: data.longitude },
      type: {
        id: data.typeId,
        name: data.typeName,
        icon: data.typeIcon,
        color: data.typeColor,
        category: data.typeCategory as any,
        description: data.typeName
      },
      priority: data.priority || IncidentPriority.MEDIUM,
      status: IncidentStatus.PENDING,
      votes: 0,
      reportedBy: data.reportedBy || "usuario-movil",
      reportedAt: new Date(),
      updatedAt: new Date(),
      photos: data.photos
    };
    setIncidents(prev => [...prev, newIncident]);
  };

  return { incidents, addIncident };
};

interface MobileCityMapProps {
  className?: string;
}

export const MobileCityMap: React.FC<MobileCityMapProps> = ({ className }) => {
  console.log("📱 MobileCityMap: Componente renderizado");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Array<{ marker: mapboxgl.Marker; id: string }>>([]);

  const { incidents, addIncident } = useIncidents();
  const { mapboxToken, viewport, isLoaded } = useMapbox();
  
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    console.log("📱 Map click detected:", e.lngLat);
    const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    
    // Para MVP móvil, crear reporte directo
    const incidentData: CreateIncidentData = {
      typeId: "mobile-report",
      typeName: "Reporte Móvil",
      typeIcon: "📱",
      typeColor: "#ef4444",
      typeCategory: "infrastructure",
      title: "Reporte desde móvil",
      description: "Incidencia reportada desde la app móvil",
      latitude: coords.lat,
      longitude: coords.lng,
      priority: IncidentPriority.MEDIUM,
      reportedBy: "usuario-movil"
    };
    
    addIncident(incidentData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [addIncident]);

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [viewport.center.lng, viewport.center.lat],
      zoom: viewport.zoom
    });

    map.current.on('load', () => {
      console.log("📱 Mapa móvil cargado");
    });

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
      }
    };
  }, [isLoaded, mapboxToken, viewport, handleMapClick]);

  // Cargar marcadores cuando cambien los incidentes
  useEffect(() => {
    if (!map.current) return;
    
    console.log("📱 Cargando marcadores:", incidents.length);

    // Limpiar marcadores existentes
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    // Agregar nuevos marcadores
    incidents.forEach((incident, index) => {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${incident.type.color || '#ef4444'};
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

      const marker = new mapboxgl.Marker(el)
        .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
        .addTo(map.current!);

      markersRef.current.push({ marker, id: incident.id });
    });
  }, [incidents]);

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      {/* Header móvil simple */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <img 
            src="https://i.ibb.co/qYMMY6dC/LogoCiudadActiva.jpg" 
            alt="Ciudad Activa" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900">Ciudad Activa</h1>
            <p className="text-xs text-gray-500">Toca el mapa para reportar</p>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Toast de confirmación */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ¡Reporte enviado! 📱
        </div>
      )}

      {/* Instrucciones móviles */}
      <div className="absolute bottom-8 left-4 right-4 z-40">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 font-medium text-center">
            💡 Toca cualquier punto del mapa para reportar una incidencia
          </p>
        </div>
      </div>
    </div>
  );
};
