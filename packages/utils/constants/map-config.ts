export const MAP_CONFIG = {
  // Mapbox configuration - will be injected by Vite
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxleGFuZGVyLW1hdG9zIiwiYSI6ImNtYno0OG5odjFuZjEya3B0bnRlZjVvcjQifQ.Tbw9vFzLJJP2Yharn7njpw',
  
  // Default map settings
  DEFAULT_CENTER: {
    lng: -74.0060, // Bogotá, Colombia (ajusta según tu ciudad)
    lat: 4.7110
  },
  
  DEFAULT_ZOOM: 12,
  
  // Map style
  MAP_STYLE: 'mapbox://styles/mapbox/streets-v12',
  
  // Incident types with colors for markers
  INCIDENT_COLORS: {
    basura: '#ef4444',     // red
    bache: '#f97316',      // orange  
    alumbrado: '#eab308',  // yellow
    otro: '#6b7280'        // gray
  }
} as const;

export type IncidentType = keyof typeof MAP_CONFIG.INCIDENT_COLORS;
