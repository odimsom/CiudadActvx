import { useState, useEffect } from 'react';
import { MAP_CONFIG } from '../../utils/constants/map-config';
import type { Coordinates, MapViewport } from '../../types/maps';

export const useMapbox = () => {
  const [viewport, setViewport] = useState<MapViewport>({
    center: MAP_CONFIG.DEFAULT_CENTER,
    zoom: MAP_CONFIG.DEFAULT_ZOOM
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Mapbox token is available
    if (!MAP_CONFIG.MAPBOX_TOKEN) {
      console.error('Mapbox token is required');
      return;
    }
    
    setIsLoaded(true);
  }, []);

  const updateViewport = (newViewport: Partial<MapViewport>) => {
    setViewport(prev => ({ ...prev, ...newViewport }));
  };

  const flyTo = (coordinates: Coordinates, zoom?: number) => {
    setViewport({
      center: coordinates,
      zoom: zoom || viewport.zoom
    });
  };

  return {
    viewport,
    isLoaded,
    updateViewport,
    flyTo,
    mapboxToken: MAP_CONFIG.MAPBOX_TOKEN,
    mapStyle: MAP_CONFIG.MAP_STYLE
  };
};
