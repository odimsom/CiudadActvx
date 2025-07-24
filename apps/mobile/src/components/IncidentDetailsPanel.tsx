import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { IncidentReport } from '@ciudad-activa/types';

interface IncidentDetailsPanelProps {
  incident: IncidentReport;
  onClose: () => void;
}

export const IncidentDetailsPanel: React.FC<IncidentDetailsPanelProps> = ({
  incident,
  onClose,
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return '#22c55e';
      case 'in_progress':
        return '#f59e0b';
      case 'reported':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'Resuelto';
      case 'in_progress':
        return 'En Progreso';
      case 'reported':
        return 'Reportado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <View style={styles.container}>
      {/* Handle para arrastrar */}
      <View style={styles.handle} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Detalles del Incidente</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Tipo de incidente */}
        <View style={styles.section}>
          <View style={styles.incidentHeader}>
            <View style={[styles.iconContainer, { backgroundColor: incident.type.color }]}>
              <Text style={styles.icon}>{incident.type.icon}</Text>
            </View>
            <View style={styles.incidentInfo}>
              <Text style={styles.incidentType}>{incident.type.name}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(incident.status) }]} />
                <Text style={styles.statusText}>{getStatusText(incident.status)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Prioridad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prioridad</Text>
          <View style={styles.priorityContainer}>
            <View style={[styles.priorityDot, { backgroundColor: incident.priority.color }]} />
            <Text style={styles.priorityText}>{incident.priority.name}</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{incident.description}</Text>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Text style={styles.coordinates}>
            📍 Lat: {incident.coordinates.lat.toFixed(6)}
          </Text>
          <Text style={styles.coordinates}>
            📍 Lng: {incident.coordinates.lng.toFixed(6)}
          </Text>
          {incident.address && (
            <Text style={styles.address}>{incident.address}</Text>
          )}
        </View>

        {/* Información de reporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Reporte</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reportado:</Text>
            <Text style={styles.infoValue}>{formatDate(incident.reportedAt)}</Text>
          </View>
          {incident.updatedAt && incident.updatedAt !== incident.reportedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Actualizado:</Text>
              <Text style={styles.infoValue}>{formatDate(incident.updatedAt)}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{incident.id}</Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📍 Ver en Mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📤 Compartir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  incidentInfo: {
    flex: 1,
  },
  incidentType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  actionsSection: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
