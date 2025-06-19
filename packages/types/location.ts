// Tipos específicos para eventos de click en el mapa
import { Coordinates, MapViewport } from './maps';

export interface MapClickEvent {
  coordinates: Coordinates;
  timestamp: Date;
  accuracy?: number;
}
