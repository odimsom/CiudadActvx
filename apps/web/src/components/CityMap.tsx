import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useMapbox } from '@ciudad-activa/maps';
import { Coordinates, IncidentReport, CreateIncidentData } from '@ciudad-activa/types';
import { IncidentFormModal } from './IncidentFormModal';
import { MapLegend } from './MapLegend';
import { IncidentDetailsPanel } from './IncidentDetailsPanel';
import { ImprovedLoadingState } from './ImprovedLoadingState';
import { useToast } from './ToastManager';
import { SubmissionStatus } from './SubmissionStatus';
import { ConnectionErrorFallback } from './ConnectionErrorFallback';
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
  const geolocateRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const { incidents, loading, error, addIncident, refreshIncidents } = useIncidents();

  // Debug log para ver qué datos llegan
  useEffect(() => {
    console.log("🔍 CityMap: Incidentes recibidos:", incidents);
    console.log("🔍 CityMap: Loading:", loading, "Error:", error);
  }, [incidents, loading, error]);
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

  // Crea un marcador con forma de ubicación (pin) y un anillo pulsante
  const createUserLocationElement = () => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      width: 28px;
      height: 28px;
      transform: translateY(-4px);
      z-index: 9999;
      pointer-events: none;
    `;

    // SVG tipo pin
    const pin = document.createElement('div');
    pin.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13401 2 5 5.13401 5 9C5 13.25 9.5 18.5 11.33 20.49C11.7056 20.9009 12.2944 20.9009 12.67 20.49C14.5 18.5 19 13.25 19 9C19 5.13401 15.866 2 12 2Z" fill="#2563eb" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="9" r="3" fill="white"/>
      </svg>
    `;
    pin.style.cssText = `
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
      transform-origin: bottom center;
    `;
    container.appendChild(pin);

    // Anillo pulsante usando Web Animations API (suave y no intrusivo)
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      width: 36px;
      height: 36px;
      border: 2px solid rgba(37,99,235,0.35);
      border-radius: 50%;
      transform: translate(-50%, -60%) scale(0.6);
      opacity: 0.7;
      pointer-events: none;
    `;
    container.appendChild(ring);

    try {
      ring.animate([
        { transform: 'translate(-50%, -60%) scale(0.6)', opacity: 0.7 },
        { transform: 'translate(-50%, -60%) scale(1.05)', opacity: 0 }
      ], { duration: 1400, iterations: Infinity, easing: 'ease-out' });
    } catch {}

    return container;
  };

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    console.log("🗺️ Map click detected:", e.lngLat);
    const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    setSelectedCoordinates(coords);
    setIsFormModalOpen(true);
    
    // Mostrar toast informativo
    showInfo('📍 Ubicación seleccionada', 'Completa el formulario para reportar el problema');
  }, [showInfo]);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    console.log("📍 Ubicación actual obtenida:", { lat, lng });
    console.log("🗺️ Estado del mapa:", map.current ? "disponible" : "no disponible");
    
    // Verificar que el mapa esté disponible y cargado
    if (!map.current) {
      console.error("❌ Mapa no disponible");
      showError('Error', 'El mapa no está disponible en este momento');
      return;
    }

    const performZoom = () => {
      try {
        // Centrar el mapa en la ubicación actual con una animación más humana (suave)
        console.log("🎯 Haciendo zoom humano a:", [lng, lat]);
        map.current!.stop();

        // Paso 1: Acercamiento intermedio rápido (simula uno o dos "scrolls" humanos)
        const currentZoom = map.current!.getZoom();
        const targetZoom = 19;
        const midZoom = Math.max(13, Math.min(16, (currentZoom + targetZoom) / 2));
        map.current!.easeTo({
          center: [lng, lat],
          zoom: midZoom,
          duration: 280,
          easing: (t) => t,
          essential: true,
        });

        // Paso 2: Vuelo suave al objetivo con curva y easing (más natural)
        setTimeout(() => {
          if (!map.current) return;
          map.current!.flyTo({
            center: [lng, lat],
            zoom: targetZoom,
            speed: 1.6,     // velocidad relativa a la distancia
            curve: 1.2,     // trayectoria más suave
            easing: (t) => 1 - Math.pow(1 - t, 2), // easeOutQuad
            essential: true,
          });
        }, 300);
        
        // Fallback: salto instantáneo si no se movió lo suficiente
        setTimeout(() => {
          if (map.current) {
            const currentCenter = map.current.getCenter();
            const targetCenter = { lng, lat };
            const distance = Math.sqrt(
              Math.pow(currentCenter.lng - targetCenter.lng, 2) + 
              Math.pow(currentCenter.lat - targetCenter.lat, 2)
            );
            
            if (distance > 0.001) {
              console.log("🔄 Salto instantáneo a ubicación (fallback)");
              map.current.jumpTo({ center: [lng, lat], zoom: targetZoom });
            }
          }
        }, 1200);
        
        // Agregar/actualizar marcador persistente de la ubicación actual
        try {
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setLngLat([lng, lat]);
            console.log("✅ Marcador de ubicación actualizado");
          } else {
            // Elemento con forma de pin y anillo pulsante
            const el = createUserLocationElement();
            userLocationMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
              .setLngLat([lng, lat])
              .addTo(map.current!);
            console.log("✅ Marcador de ubicación agregado (persistente)");
          }
        } catch (mErr) {
          console.warn('⚠️ No se pudo crear/actualizar el marcador de ubicación:', mErr);
        }
        
        // Mostrar toast informativo
        showSuccess('📍 Ubicación encontrada', 'Aquí es donde te encuentras actualmente');
        
      } catch (error) {
        console.error("❌ Error al centrar mapa:", error);
        showError('Error', 'No se pudo centrar el mapa en tu ubicación');
      }
    };

    // Verificar si el mapa está cargado
    if (map.current.isStyleLoaded()) {
      console.log("🗺️ Mapa ya está cargado, procediendo con zoom");
      performZoom();
    } else {
      console.log("🗺️ Mapa no está cargado, esperando evento 'load'");
      map.current.once('load', () => {
        console.log("🗺️ Mapa cargado, procediendo con zoom");
        performZoom();
      });
    }
  }, [showSuccess, showError]);

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
        // Agregar GeolocateControl para mayor fiabilidad en geolocalización
        try {
          if (!geolocateRef.current) {
            geolocateRef.current = new mapboxgl.GeolocateControl({
              positionOptions: { enableHighAccuracy: true },
              trackUserLocation: true,
              showUserLocation: true,
              showAccuracyCircle: false,
              fitBoundsOptions: { maxZoom: 19 }
            });
            // Usamos bottom-left para no interferir visualmente con nuestro botón custom en bottom-right
            if (map.current) {
              map.current.addControl(geolocateRef.current, 'bottom-left');
            }

            // Cuando el control obtiene ubicación, reutilizamos nuestra lógica de centrado/zoom
            geolocateRef.current.on('geolocate', (e: GeolocationPosition) => {
              const { latitude, longitude } = e.coords;
              console.log('📍 GeolocateControl result ->', { latitude, longitude });
              handleLocationFound(latitude, longitude);
            });

            geolocateRef.current.on('error', (err: any) => {
              console.warn('⚠️ GeolocateControl error:', err);
            });
          }
        } catch (geoErr) {
          console.warn('⚠️ No se pudo inicializar GeolocateControl:', geoErr);
        }
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
      
  {/* Error de conexión fallback: solo si no hay datos para mostrar */}
  {error && !loading && incidents.length === 0 && (
        <ConnectionErrorFallback 
          error={error}
          onRetry={refreshIncidents}
          isRetrying={loading}
        />
      )}
      
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

      {/* BOTÓN DE UBICACIÓN ACTUAL - ABAJO A LA DERECHA */}
      <div className="fixed bottom-24 right-4 z-[9999]">
        <button
          onClick={() => {
            console.log("🔵 BOTÓN DE UBICACIÓN CLICKEADO!");
            console.log("🗺️ Estado del mapa al hacer click:", map.current ? "disponible" : "no disponible");
            
            if (!("geolocation" in navigator)) {
              showError('Error', 'Tu navegador no soporta geolocalización');
              return;
            }

            // Mostrar loading
            showInfo('📍 Buscando ubicación', 'Obteniendo tu ubicación actual...');
            // 1) Intento principal: usar GeolocateControl de Mapbox (más confiable y auto-centrado)
            if (geolocateRef.current) {
              let handled = false;
              const onErr = (err: any) => {
                geolocateRef.current?.off('geolocate', onGeo as any);
                geolocateRef.current?.off('error', onErr as any);
                console.warn('⚠️ Falla GeolocateControl, usando fallback:', err);
                // Fallback a navigator.geolocation
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    if (!isNaN(latitude) && !isNaN(longitude)) {
                      handleLocationFound(latitude, longitude);
                    } else {
                      showError('Error', 'Coordenadas inválidas del GPS');
                    }
                  },
                  (error) => {
                    console.error('❌ Error geolocalización (fallback):', error);
                    let errorMessage = 'No se pudo obtener la ubicación';
                    switch (error.code) {
                      case error.PERMISSION_DENIED:
                        errorMessage = 'Permisos de ubicación denegados. Por favor, permite el acceso a tu ubicación.';
                        break;
                      case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Información de ubicación no disponible.';
                        break;
                      case error.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
                        break;
                    }
                    showError('Error de Ubicación', errorMessage);
                  },
                  { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
                );
              };
              const onGeo = (e: GeolocationPosition) => {
                handled = true;
                geolocateRef.current?.off('geolocate', onGeo as any);
                geolocateRef.current?.off('error', onErr as any);
                const { latitude, longitude } = e.coords;
                console.log('📍 Ubicación via GeolocateControl:', { latitude, longitude });
                handleLocationFound(latitude, longitude);
              };
              // Nos suscribimos de forma temporal para esta búsqueda
              geolocateRef.current.on('geolocate', onGeo as any);
              geolocateRef.current.on('error', onErr as any);
              try {
                geolocateRef.current.trigger();
                // Fallback por timeout si el control no responde
                setTimeout(() => {
                  if (!handled) {
                    console.warn('⏰ GeolocateControl tardó demasiado, usando fallback');
                    onErr(new Error('timeout'));
                  }
                }, 3000);
              } catch (err) {
                console.warn('⚠️ No se pudo disparar GeolocateControl, usando fallback');
                onErr(err);
              }
              return;
            }

            // 2) Fallback: usar directamente navigator.geolocation
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Ubicación obtenida del GPS:', { latitude, longitude });
                if (isNaN(latitude) || isNaN(longitude)) {
                  console.error('❌ Coordenadas inválidas:', { latitude, longitude });
                  showError('Error', 'Las coordenadas obtenidas no son válidas');
                  return;
                }
                handleLocationFound(latitude, longitude);
              },
              (error) => {
                console.error('❌ Error geolocalización:', error);
                let errorMessage = 'No se pudo obtener la ubicación';
                switch (error.code) {
                  case error.PERMISSION_DENIED:
                    errorMessage = 'Permisos de ubicación denegados. Por favor, permite el acceso a tu ubicación.';
                    break;
                  case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Información de ubicación no disponible.';
                    break;
                  case error.TIMEOUT:
                    errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
                    break;
                }
                showError('Error de Ubicación', errorMessage);
              },
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
            );
          }}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl border-2 border-white transition-all duration-300 hover:scale-110 font-medium group active:scale-95"
          title="Ver mi ubicación actual en el mapa"
        >
          <MapPin className="w-5 h-5" />
          <span className="hidden group-hover:inline-block transition-all duration-200">Mi Ubicación</span>
        </button>
      </div>

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
