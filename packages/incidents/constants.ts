import { IncidentType, IncidentCategory } from '../types/incidents';

export const INCIDENT_TYPES: IncidentType[] = [
  {
    id: 'waste-garbage',
    name: 'Basura acumulada',
    icon: 'Trash2',
    color: '#ef4444',
    category: IncidentCategory.WASTE,
    description: 'Acumulación de basura en espacios públicos'
  },
  {
    id: 'waste-recycling',
    name: 'Contenedor de reciclaje lleno',
    icon: 'Recycle',
    color: '#22c55e',
    category: IncidentCategory.WASTE,
    description: 'Contenedor de reciclaje que necesita vaciado'
  },
  {
    id: 'infrastructure-pothole',
    name: 'Bache en la vía',
    icon: 'Construction',
    color: '#f59e0b',
    category: IncidentCategory.INFRASTRUCTURE,
    description: 'Deterioro o agujero en la calzada'
  },
  {
    id: 'infrastructure-lighting',
    name: 'Iluminación pública',
    icon: 'Lightbulb',
    color: '#fbbf24',
    category: IncidentCategory.INFRASTRUCTURE,
    description: 'Falla en el alumbrado público'
  },
  {
    id: 'safety-vandalism',
    name: 'Vandalismo',
    icon: 'Shield',
    color: '#dc2626',
    category: IncidentCategory.SAFETY,
    description: 'Daños por vandalismo en mobiliario urbano'
  },
  {
    id: 'environment-tree',
    name: 'Árbol caído/peligroso',
    icon: 'Tree',
    color: '#16a34a',
    category: IncidentCategory.ENVIRONMENT,
    description: 'Árbol que representa peligro o ha caído'
  },
  {
    id: 'transportation-traffic',
    name: 'Problema de tráfico',
    icon: 'Car',
    color: '#2563eb',
    category: IncidentCategory.TRANSPORTATION,
    description: 'Congestión o problemas de tráfico'
  },
  {
    id: 'other-general',
    name: 'Otro problema',
    icon: 'AlertTriangle',
    color: '#7c3aed',
    category: IncidentCategory.OTHER,
    description: 'Otros problemas urbanos'
  }
];

export const INCIDENT_CATEGORIES_INFO = {
  [IncidentCategory.WASTE]: {
    name: 'Residuos',
    color: '#ef4444',
    icon: 'Trash2'
  },
  [IncidentCategory.INFRASTRUCTURE]: {
    name: 'Infraestructura',
    color: '#f59e0b',
    icon: 'Construction'
  },
  [IncidentCategory.SAFETY]: {
    name: 'Seguridad',
    color: '#dc2626',
    icon: 'Shield'
  },
  [IncidentCategory.ENVIRONMENT]: {
    name: 'Medio Ambiente',
    color: '#16a34a',
    icon: 'Tree'
  },
  [IncidentCategory.TRANSPORTATION]: {
    name: 'Transporte',
    color: '#2563eb',
    icon: 'Car'
  },
  [IncidentCategory.OTHER]: {
    name: 'Otros',
    color: '#7c3aed',
    icon: 'AlertTriangle'
  }
};
