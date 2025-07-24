import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Coordinates, CreateIncidentData } from '@ciudad-activa/types';

interface IncidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIncidentData) => void;
  coordinates: Coordinates | null;
}

const INCIDENT_TYPES = [
  { id: 'bache', name: 'Baches', color: '#ef4444', icon: '🕳️' },
  { id: 'alumbrado', name: 'Alumbrado', color: '#f59e0b', icon: '💡' },
  { id: 'basura', name: 'Basura', color: '#22c55e', icon: '🗑️' },
  { id: 'semaforo', name: 'Semáforos', color: '#3b82f6', icon: '🚦' },
  { id: 'agua', name: 'Agua', color: '#06b6d4', icon: '💧' },
  { id: 'vialidad', name: 'Vialidad', color: '#8b5cf6', icon: '🚧' },
];

const PRIORITIES = [
  { id: 'low', name: 'Baja', color: '#22c55e' },
  { id: 'medium', name: 'Media', color: '#f59e0b' },
  { id: 'high', name: 'Alta', color: '#ef4444' },
  { id: 'urgent', name: 'Urgente', color: '#dc2626' },
];

export const IncidentFormModal: React.FC<IncidentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  coordinates,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de incidente');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Por favor proporciona una descripción');
      return;
    }

    setIsSubmitting(true);

    const incidentType = INCIDENT_TYPES.find(t => t.id === selectedType);
    const priority = PRIORITIES.find(p => p.id === selectedPriority);

    if (!incidentType || !priority) {
      Alert.alert('Error', 'Datos inválidos');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit({
        type: {
          id: incidentType.id,
          name: incidentType.name,
          color: incidentType.color,
          icon: incidentType.icon,
        },
        priority: {
          id: priority.id,
          name: priority.name,
          color: priority.color,
        },
        description: description.trim(),
      });

      // Reset form
      setSelectedType('');
      setSelectedPriority('medium');
      setDescription('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Reportar Incidente</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Coordinates info */}
          {coordinates && (
            <View style={styles.coordinatesInfo}>
              <Text style={styles.coordinatesText}>
                📍 Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
              </Text>
            </View>
          )}

          {/* Tipo de incidente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Incidente</Text>
            <View style={styles.typeGrid}>
              {INCIDENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && styles.selectedTypeButton,
                    { borderColor: type.color },
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeName,
                    selectedType === type.id && styles.selectedTypeName,
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Prioridad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prioridad</Text>
            <View style={styles.priorityContainer}>
              {PRIORITIES.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  style={[
                    styles.priorityButton,
                    selectedPriority === priority.id && [
                      styles.selectedPriorityButton,
                      { backgroundColor: priority.color },
                    ],
                  ]}
                  onPress={() => setSelectedPriority(priority.id)}
                >
                  <Text style={[
                    styles.priorityText,
                    selectedPriority === priority.id && styles.selectedPriorityText,
                  ]}>
                    {priority.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe el problema con detalle..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Botón de envío */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedType || !description.trim() || isSubmitting) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!selectedType || !description.trim() || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Enviando...' : 'Reportar Incidente'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  coordinatesInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '48%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedTypeButton: {
    backgroundColor: '#f0f9ff',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedTypeName: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedPriorityButton: {
    borderColor: 'transparent',
  },
  priorityText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPriorityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
