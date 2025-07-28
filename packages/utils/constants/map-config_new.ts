// Get environment variable in a way that works for both Node.js and browsers
const getMapboxToken = () => {
  if (typeof window !== "undefined") {
    // Browser environment - try to access import.meta.env safely
    try {
      return (
        (import.meta as any)?.env?.VITE_MAPBOX_TOKEN ||
        "pk.eyJ1Ijoib2RpbXNvbSIsImEiOiJjbWRoOXcwa3cwMTg4MmtuOWdnaTVyamc0In0.5geWHeQ9BZQLSOSxW6OJ1A"
      );
    } catch {
      return "pk.eyJ1Ijoib2RpbXNvbSIsImEiOiJjbWRoOXcwa3cwMTg4MmtuOWdnaTVyamc0In0.5geWHeQ9BZQLSOSxW6OJ1A";
    }
  } else {
    // Node.js environment - use fallback token
    return "pk.eyJ1Ijoib2RpbXNvbSIsImEiOiJjbWRoOXcwa3cwMTg4MmtuOWdnaTVyamc0In0.5geWHeQ9BZQLSOSxW6OJ1A";
  }
};

export const MAP_CONFIG = {
  // Mapbox configuration
  MAPBOX_TOKEN: getMapboxToken(),

  // Default map settings
  DEFAULT_CENTER: {
    lng: -69.9312, // Santo Domingo, República Dominicana
    lat: 18.4861,
  },

  DEFAULT_ZOOM: 12,

  // Incident colors for different types
  INCIDENT_COLORS: {
    traffic: "#ff6b6b",
    infrastructure: "#4ecdc4",
    safety: "#45b7d1",
    environment: "#96ceb4",
    social: "#feca57",
    other: "#8e7cc3",
  },
} as const;

export type IncidentType = keyof typeof MAP_CONFIG.INCIDENT_COLORS;
