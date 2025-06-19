export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
}

export interface MapMarker {
  id: string;
  coordinates: Coordinates;
  type: string;
  color?: string;
}
