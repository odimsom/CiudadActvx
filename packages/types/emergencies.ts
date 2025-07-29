// Tipos para el sistema de emergencias

export enum EmergencyType {
  FLOOD = "flood",
  EARTHQUAKE = "earthquake",
  FIRE = "fire",
  HURRICANE = "hurricane",
  OTHER = "other",
}

export enum EmergencyStatus {
  ACTIVE = "active",
  RESOLVED = "resolved",
  MONITORING = "monitoring",
}

export enum EmergencyPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface EmergencyReport {
  id: string;
  type: EmergencyType;
  title: string;
  description?: string;
  province: string;
  municipality?: string;
  latitude?: number;
  longitude?: number;
  status: EmergencyStatus;
  priority: EmergencyPriority;
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  imageUrl?: string;
  affectedPeople?: number;
  estimatedDamage?: string;
  response?: string;
  isPublic: boolean;
}

export interface CreateEmergencyData {
  type: EmergencyType;
  title: string;
  description?: string;
  province: string;
  municipality?: string;
  latitude?: number;
  longitude?: number;
  priority?: EmergencyPriority;
  reportedBy?: string;
  imageUrl?: string;
  affectedPeople?: number;
  estimatedDamage?: string;
}

export interface EmergencyStats {
  total: number;
  active: number;
  resolved: number;
  byType: Record<EmergencyType, number>;
  byProvince: Record<string, number>;
  last24Hours: number;
}
