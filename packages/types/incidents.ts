// Tipos para el sistema de incidencias
import { Coordinates } from './maps';

export interface IncidentType {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: IncidentCategory;
  description: string;
  emoji?: string;
  severity?: 'low' | 'medium' | 'high';
  estimatedResolveTime?: string;
  tags?: string[];
  isUrgent?: boolean;
}

export enum IncidentCategory {
  WASTE = 'waste',
  INFRASTRUCTURE = 'infrastructure',
  SAFETY = 'safety',
  ENVIRONMENT = 'environment',
  TRANSPORTATION = 'transportation',
  OTHER = 'other'
}

export enum IncidentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export enum IncidentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface IncidentReport {
  id: string;
  type: IncidentType;
  title: string;
  description?: string;
  coordinates: Coordinates;
  address?: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  photos?: string[];
  images?: IncidentImage[];
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  estimatedResolution?: Date;
  assignedTo?: string;
  assignedTeam?: string;
  notes?: string[];
  votes?: number; // Para sistema de votos de la comunidad
  views?: number; // Número de visualizaciones
  isPublic?: boolean;
  tags?: string[];
  relatedIncidents?: string[]; // IDs de incidencias relacionadas
  cost?: number; // Costo estimado de reparación
  beforeImages?: IncidentImage[];
  afterImages?: IncidentImage[];
}

export interface CreateIncidentData {
  typeId: string;
  title: string;
  description?: string;
  coordinates: Coordinates;
  photos?: string[];
  priority?: IncidentPriority;
}

export interface IncidentImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  uploadedAt: Date;
  size?: number;
  mimeType?: string;
}
