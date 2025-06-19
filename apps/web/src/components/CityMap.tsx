import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion } from 'framer-motion';
import { useMapbox } from '@ciudad-activa/maps/hooks/useMapbox';
import { Coordinates, IncidentReport, CreateIncidentData } from '@ciudad-activa/types';
import { IncidentFormModal } from './IncidentFormModal';
import { MapLegend } from './MapLegend';
import { IncidentDetailsPanel } from './IncidentDetailsPanel';
import { IncidentMarker } from './IncidentMarker';
import { useIncidents } from '../hooks/useIncidents';
import { SonarWave } from './SonarWave';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CityMapProps {
  className?: string;
}

const LONG_PRESS_DURATION = 350; // 350ms para activar el sonar
const MOVEMENT_THRESHOLD = 12; // 12 píxeles de tolerancia
const VELOCITY_THRESHOLD = 0.5; // píxeles por ms - si se mueve muy rápido, es drag
const AUTO_COMPLETE_DELAY = 150; // 150ms después del sonar para apertura MÁS RÁPIDA

export const CityMap: React.FC<CityMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // Control de gestos mejorado
  const pressTimer = useRef<number | null>(null);
  const autoCompleteTimer = useRef<number | null>(null);
  const initialPosition = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastPosition = useRef<{ x: number; y: number; time: number } | null>(null);
  const isPressed = useRef(false);
  const isDragging = useRef(false);

  const { viewport, isLoaded, mapboxToken } = useMapbox();
  const { incidents, createIncident } = useIncidents();

  // Estados
  const [sonarState, setSonarState] = useState<{
    isActive: boolean;
    coordinates: { x: number; y: number } | null;
  }>({
    isActive: false,
    coordinates: null,
  });
  
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(false);
  
  // Nuevos estados para los componentes
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  // Configurar el mapa
  useEffect(() => {
    if (!isLoaded || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [viewport.center.lng, viewport.center.lat],
        zoom: viewport.zoom
      });

      map.current.on('load', () => {
        console.log('✅ Mapa cargado correctamente');
        loadIncidentsOnMap();
      });

    } catch (error) {
      console.error('❌ Error al crear el mapa:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [isLoaded, mapboxToken, viewport]);

  // Cargar incidencias como marcadores FIJOS
  const loadIncidentsOnMap = useCallback(() => {
    if (!map.current) return;

    // Limpiar marcadores existentes
    document.querySelectorAll('.incident-marker-wrapper').forEach(marker => marker.remove());

    incidents.forEach((incident: IncidentReport) => {
      const markerWrapper = document.createElement('div');
      markerWrapper.className = 'incident-marker-wrapper';

      const markerElement = document.createElement('div');
      markerElement.style.cssText = `
        width: 26px;
        height: 26px;
        background: ${incident.type.color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        color: white;
        transition: all 0.2s ease;
        position: relative;
        z-index: 10;
      `;
      
      markerElement.innerHTML = '⚠';
      
      // Efecto hover
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
        markerElement.style.zIndex = '20';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.zIndex = '10';
      });

      markerWrapper.appendChild(markerElement);

      // Popup limpio
      const popup = new mapboxgl.Popup({ 
        offset: 30,
        closeButton: false,
        className: 'clean-incident-popup'
      }).setHTML(`
        <div class="p-3 bg-white rounded-lg shadow-lg border max-w-xs">
          <h3 class="font-semibold text-sm text-gray-800 mb-1">${incident.type.name}</h3>
          <p class="text-xs text-gray-600 mb-2">${incident.description || 'Sin descripción'}</p>
          <div class="text-xs text-gray-500">
            ${new Date(incident.reportedAt).toLocaleDateString('es-ES')}
          </div>
        </div>
      `);

      // Crear marcador FIJO
      new mapboxgl.Marker(markerWrapper)
        .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [incidents]);

  // Calcular velocidad de movimiento
  const calculateVelocity = useCallback((currentPos: { x: number; y: number; time: number }) => {
    if (!lastPosition.current) return 0;
    
    const deltaX = currentPos.x - lastPosition.current.x;
    const deltaY = currentPos.y - lastPosition.current.y;
    const deltaTime = currentPos.time - lastPosition.current.time;
    
    if (deltaTime === 0) return 0;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance / deltaTime; // píxeles por milisegundo
  }, []);

  // Iniciar pulsación
  const startPress = useCallback((x: number, y: number) => {
    const now = Date.now();
    isPressed.current = true;
    isDragging.current = false;
    
    initialPosition.current = { x, y, time: now };
    lastPosition.current = { x, y, time: now };
    
    setShowCrosshair(true);

    // Timer para activar sonar
    pressTimer.current = window.setTimeout(() => {
      if (isPressed.current && !isDragging.current) {
        // Usar la posición INICIAL del clic para centrar el sonar
        setSonarState({
          isActive: true,
          coordinates: { x: initialPosition.current!.x, y: initialPosition.current!.y }
        });

        // Auto-completar después del sonar
        autoCompleteTimer.current = window.setTimeout(() => {
          if (isPressed.current && !isDragging.current) {
            completePress();
          }
        }, AUTO_COMPLETE_DELAY);
      }
    }, LONG_PRESS_DURATION);
  }, []);

  // Detectar movimiento inteligentemente
  const handleMovement = useCallback((x: number, y: number) => {
    if (!isPressed.current || !initialPosition.current) return;

    const now = Date.now();
    const currentPos = { x, y, time: now };
    
    // Calcular distancia desde el punto inicial
    const deltaX = x - initialPosition.current.x;
    const deltaY = y - initialPosition.current.y;
    const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Calcular velocidad de movimiento
    const velocity = calculateVelocity(currentPos);
    
    // Actualizar última posición
    lastPosition.current = currentPos;
    
    // Determinar si es un arrastre basado en distancia Y velocidad
    if (totalDistance > MOVEMENT_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      isDragging.current = true;
      cancelPress();
      return;
    }
  }, [calculateVelocity]);

  const cancelPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    if (autoCompleteTimer.current) {
      clearTimeout(autoCompleteTimer.current);
      autoCompleteTimer.current = null;
    }
    
    isPressed.current = false;
    isDragging.current = false;
    initialPosition.current = null;
    lastPosition.current = null;
    
    setShowCrosshair(false);
    setSonarState({ isActive: false, coordinates: null });
  }, []);

  const completePress = useCallback(() => {
    if (!initialPosition.current || !map.current) return;

    // Usar la posición INICIAL para crear la incidencia
    const lngLat = map.current.unproject([
      initialPosition.current.x,
      initialPosition.current.y
    ]);

    setSelectedCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
    setIsFormModalOpen(true);
    
    cancelPress();
  }, [cancelPress]);

  // Event handlers optimizados
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (event.button !== 0) return;
    
    // Usar coordenadas globales para el sonar (se ve exactamente donde hiciste clic)
    startPress(event.clientX, event.clientY);
  }, [startPress]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (isPressed.current) {
      handleMovement(event.clientX, event.clientY);
    }
  }, [handleMovement]);

  const handlePointerUp = useCallback(() => {
    if (!sonarState.isActive) {
      cancelPress();
    }
    // Si el sonar está activo, dejar que se complete automáticamente
  }, [sonarState.isActive, cancelPress]);

  // Cargar incidencias cuando cambien
  useEffect(() => {
    loadIncidentsOnMap();
  }, [loadIncidentsOnMap]);

  return (
    <motion.div
      className={`relative ${className} ${showCrosshair ? 'cursor-crosshair' : 'cursor-default'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={cancelPress}
      style={{ touchAction: 'pan-x pan-y' }} // Permitir pan del mapa
    >
      <div ref={mapContainer} className="h-full w-full" />

      <SonarWave 
        isActive={sonarState.isActive}
        coordinates={sonarState.coordinates}
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-700">Cargando mapa...</p>
          </div>
        </div>
      )}      {selectedCoordinates && (
        <IncidentFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedCoordinates(null);
          }}
          onSubmit={async (data: CreateIncidentData) => {
            await createIncident(data);
            setIsFormModalOpen(false);
            setSelectedCoordinates(null);
          }}
          coordinates={selectedCoordinates}
        />
      )}

      {/* Leyenda del mapa */}
      <MapLegend />

      {/* Panel de detalles de incidencia */}
      <IncidentDetailsPanel
        incident={selectedIncident}
        isOpen={isDetailsPanelOpen}
        onClose={() => {
          setIsDetailsPanelOpen(false);
          setSelectedIncident(null);
        }}
      />

      {/* Marcadores de incidencias mejorados */}
      {incidents.map((incident) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'incident-marker-container';
        
        // Crear marcador personalizado si no existe
        const existingMarker = map.current?.getSource(`incident-${incident.id}`);
        if (!existingMarker && map.current) {
          // Renderizar el componente IncidentMarker
          import('react-dom/client').then(({ createRoot }) => {
            const root = createRoot(markerElement);
            root.render(
              <IncidentMarker
                incident={incident}
                isSelected={selectedIncident?.id === incident.id}
                onClick={() => {
                  setSelectedIncident(incident);
                  setIsDetailsPanelOpen(true);
                }}
                size="medium"
              />
            );
          });

          // Crear el marcador de Mapbox
          new mapboxgl.Marker(markerElement)
            .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
            .addTo(map.current);
        }
        
        return null;
      })}      {/* Leyenda del mapa */}
      <MapLegend />

      {/* Panel de detalles de incidencia */}
      <IncidentDetailsPanel
        incident={selectedIncident}
        isOpen={isDetailsPanelOpen}
        onClose={() => {
          setIsDetailsPanelOpen(false);
          setSelectedIncident(null);
        }}
      />
    </motion.div>
  );
};
