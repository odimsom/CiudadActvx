import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../hooks/useMapbox';

// CSS ya se importa en main.tsx

interface MapViewProps {
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  className
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const { viewport, isLoaded, mapboxToken } = useMapbox();

  useEffect(() => {
    console.log('🔍 MapView useEffect:', { 
      isLoaded, 
      mapContainer: !!mapContainer.current, 
      map: !!map.current,
      token: mapboxToken?.substring(0, 20) + '...'
    });
    
    if (!isLoaded || !mapContainer.current || map.current) return;

    console.log('🗺️ Inicializando mapa...');

    // Set access token exactly like the HTML example
    mapboxgl.accessToken = mapboxToken;

    try {
      // Create map exactly like the HTML example
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [viewport.center.lng, viewport.center.lat],
        zoom: viewport.zoom
      });

      console.log('✅ Mapa creado exitosamente');

      // Add simple click handler like the example
      map.current.on('click', (event) => {
        console.log('🖱️ Click coordinates:', event.lngLat);
      });

      map.current.on('load', () => {
        console.log('✅ Mapa cargado completamente');
      });

      map.current.on('error', (error) => {
        console.error('❌ Error en el mapa:', error);
      });
    } catch (error) {
      console.error('❌ Error al crear el mapa:', error);
    }

    return () => {
      console.log('🧹 Limpiando mapa');
      map.current?.remove();
    };
  }, [isLoaded, mapboxToken, viewport]);

  console.log('🎨 Renderizando MapView:', { isLoaded });
  if (!isLoaded) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <p>Cargando mapa...</p>
      </div>
    );
  }
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Top Control Bar */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 2000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 20, 
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          Ciudad Activa
        </h1>
        
        {/* Status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#10b981'
          }}></div>
          <span style={{ fontSize: 14, color: '#6b7280' }}>
            Mapa activo
          </span>
        </div>
      </div>
      
      {/* Bottom Info Panel */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 2000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        fontSize: 12,
        color: '#6b7280'
      }}>
        <div>© Mapbox © OpenStreetMap</div>
        <div style={{ marginTop: 4 }}>
          Click en el mapa para ver coordenadas
        </div>
      </div>
    </div>
  );
};
