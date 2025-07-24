import { useState, useEffect, useRef } from 'react';
import { IncidentReport, CreateIncidentData, IncidentStatus, IncidentPriority, IncidentCategory } from '@ciudad-activa/types';
import { SimpleServer } from '../utils/simpleServer';

// Datos de ejemplo
const EXAMPLE_INCIDENTS: IncidentReport[] = [
  {
    id: '1',
    type: {
      id: 'waste-garbage',
      name: 'Basura acumulada',
      icon: 'Trash2',
      color: '#ef4444',
      category: IncidentCategory.WASTE,
      description: 'Acumulación de basura en espacios públicos'
    },
    title: 'Basura acumulada en parque central',
    description: 'Gran cantidad de desechos en la entrada del parque',
    coordinates: { lat: 18.4861, lng: -69.9312 },
    address: 'Zona Colonial, Santo Domingo',
    status: IncidentStatus.PENDING,
    priority: IncidentPriority.HIGH,
    reportedBy: 'Usuario Demo',
    reportedAt: new Date('2024-06-15T10:30:00'),
    updatedAt: new Date('2024-06-15T10:30:00')
  },
  {
    id: '2',
    type: {
      id: 'infrastructure-pothole',
      name: 'Bache en la vía',
      icon: 'Construction',
      color: '#f59e0b',
      category: IncidentCategory.INFRASTRUCTURE,
      description: 'Deterioro en la calzada'
    },
    title: 'Bache grande en Carrera 70',
    description: 'Bache profundo que puede dañar vehículos',
    coordinates: { lat: 6.2518, lng: -75.5636 },
    address: 'Carrera 70 con Calle 50',
    status: IncidentStatus.IN_PROGRESS,
    priority: IncidentPriority.MEDIUM,
    reportedBy: 'Ciudadano Activo',
    reportedAt: new Date('2024-06-14T15:45:00'),
    updatedAt: new Date('2024-06-16T09:20:00')
  },
  {
    id: '3',
    type: {
      id: 'infrastructure-lighting',
      name: 'Iluminación pública',
      icon: 'Lightbulb',
      color: '#fbbf24',
      category: IncidentCategory.INFRASTRUCTURE,
      description: 'Falla en el alumbrado'
    },
    title: 'Poste de luz fundido',
    coordinates: { lat: 18.4747, lng: -69.9173 },
    address: 'Piantini, Santo Domingo',
    status: IncidentStatus.RESOLVED,
    priority: IncidentPriority.LOW,
    reportedBy: 'Vecino Preocupado',
    reportedAt: new Date('2024-06-10T20:15:00'),
    updatedAt: new Date('2024-06-17T14:30:00')
  }
];

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const serverRef = useRef<SimpleServer | null>(null);

  // Inicializar servidor y suscribirse a cambios
  useEffect(() => {
    serverRef.current = SimpleServer.getInstance();
    
    // Solicitar permisos de notificación
    serverRef.current.requestNotificationPermission();
    
    // Suscribirse a actualizaciones del servidor
    const unsubscribe = serverRef.current.subscribe((serverIncidents) => {
      // Convertir datos del servidor a formato local
      const processedIncidents = serverIncidents.map((incident: any) => ({
        ...incident,
        reportedAt: new Date(incident.reportedAt),
        updatedAt: new Date(incident.updatedAt),
        estimatedResolution: incident.estimatedResolution 
          ? new Date(incident.estimatedResolution) 
          : undefined
      }));
      
      setIncidents(processedIncidents);
      setLoading(false);
    });

    // Inicializar con datos de ejemplo si no hay datos
    const serverData = serverRef.current.getServerData();
    if (serverData.length === 0) {
      EXAMPLE_INCIDENTS.forEach(incident => {
        serverRef.current?.addReport({
          ...incident,
          reportedAt: incident.reportedAt.toISOString(),
          updatedAt: incident.updatedAt.toISOString()
        });
      });
    }

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // No destruir el servidor ya que es singleton y puede ser usado por otros componentes
    };
  }, []);

  const createIncident = (data: CreateIncidentData): IncidentReport => {
    const newIncident: IncidentReport = {
      id: Date.now().toString(),
      type: EXAMPLE_INCIDENTS[0].type, // Temporalmente usar el primer tipo
      title: data.title,
      description: data.description,
      coordinates: data.coordinates,
      status: IncidentStatus.PENDING,
      priority: data.priority || IncidentPriority.MEDIUM,
      photos: data.photos,
      reportedBy: 'Usuario Actual',
      reportedAt: new Date(),
      updatedAt: new Date()
    };

    // Enviar al servidor
    if (serverRef.current) {
      const serverIncident = {
        ...newIncident,
        reportedAt: newIncident.reportedAt.toISOString(),
        updatedAt: newIncident.updatedAt.toISOString()
      };
      serverRef.current.addReport(serverIncident);
    }
    
    return newIncident;
  };

  const updateIncident = (id: string, updates: Partial<IncidentReport>) => {
    if (serverRef.current) {
      const serverUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      serverRef.current.updateReport(id, serverUpdates);
    }
  };

  const deleteIncident = (id: string) => {
    if (serverRef.current) {
      serverRef.current.deleteReport(id);
    }
  };

  const getIncidentsByStatus = (status: IncidentStatus) => {
    return incidents.filter(incident => incident.status === status);
  };

  const getIncidentsByPriority = (priority: IncidentPriority) => {
    return incidents.filter(incident => incident.priority === priority);
  };

  return {
    incidents,
    loading,
    createIncident,
    updateIncident,
    deleteIncident,
    getIncidentsByStatus,
    getIncidentsByPriority
  };
};
