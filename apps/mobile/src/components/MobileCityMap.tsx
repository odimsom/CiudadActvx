import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '@ciudad-activa/maps';
import { Coordinates, IncidentReport, CreateIncidentData, IncidentStatus, IncidentPriority } from '@ciudad-activa/types';
import { MobileReportModal } from './MobileReportModal';
import { MobileTutorial } from './MobileTutorial';
import { Camera, Plus } from 'lucide-react';
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
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Verificar si es la primera vez que usa la app
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ciudadActiva_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // Obtener ubicación actual del usuario
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          console.log('📍 Ubicación del usuario obtenida:', coords);
        },
        (error) => {
          console.log('❌ Error obteniendo ubicación:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }, []);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    console.log("📱 Map click detected:", e.lngLat);
    const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    
    // Abrir modal de reporte con las coordenadas seleccionadas
    setSelectedCoordinates(coords);
    setShowReportModal(true);
  }, []);

  const handleReportSubmit = async (data: CreateIncidentData) => {
    try {
      console.log("📱 Enviando reporte:", data);
      await addIncident(data);
      setShowReportModal(false);
      setSelectedCoordinates(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("❌ Error al enviar reporte:", error);
    }
  };

  const handleQuickReport = () => {
    if (userLocation) {
      setSelectedCoordinates(userLocation);
      setShowReportModal(true);
    } else {
      alert('Necesitamos acceso a tu ubicación para esta función');
    }
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('ciudadActiva_tutorial_seen', 'true');
    setShowTutorial(false);
  };

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
      {/* Tutorial de introducción */}
      <MobileTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      {/* Modal de reporte */}
      <MobileReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedCoordinates(null);
        }}
        coordinates={selectedCoordinates}
        userLocation={userLocation}
        onSubmit={handleReportSubmit}
      />

      {/* Header móvil mejorado */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/qYMMY6dC/LogoCiudadActiva.jpg" 
              alt="Ciudad Activa" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Ciudad Activa</h1>
              <p className="text-xs text-gray-500">
                {userLocation ? '📍 Ubicación detectada' : 'Toca el mapa para reportar'}
              </p>
            </div>
          </div>
          
          {/* Botón para reabrir tutorial */}
          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver tutorial"
          >
            ?
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Botón flotante para reporte rápido */}
      {userLocation && (
        <button
          onClick={handleQuickReport}
          className="absolute bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-105"
          title="Reportar desde mi ubicación"
        >
          <Camera className="w-6 h-6" />
        </button>
      )}

      {/* Toast de confirmación */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          ¡Reporte enviado! 📱
        </div>
      )}

      {/* Instrucciones mejoradas */}
      <div className="absolute bottom-8 left-4 right-4 z-40">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">
                Tres formas de reportar:
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Toca cualquier punto del mapa</li>
                <li>• Usa el botón flotante azul ↗️</li>
                <li>• Permitir ubicación automática</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
