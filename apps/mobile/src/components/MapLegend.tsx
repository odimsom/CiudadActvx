import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const INCIDENT_TYPES = [
  { id: 'bache', name: 'Baches', color: '#ef4444', icon: '🕳️' },
  { id: 'alumbrado', name: 'Alumbrado', color: '#f59e0b', icon: '💡' },
  { id: 'basura', name: 'Basura', color: '#22c55e', icon: '🗑️' },
  { id: 'semaforo', name: 'Semáforos', color: '#3b82f6', icon: '🚦' },
  { id: 'agua', name: 'Agua', color: '#06b6d4', icon: '💧' },
  { id: 'vialidad', name: 'Vialidad', color: '#8b5cf6', icon: '🚧' },
];

export const MapLegend: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tipos de Incidentes</Text>
      {INCIDENT_TYPES.map((type) => (
        <View key={type.id} style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: type.color }]} />
          <Text style={styles.icon}>{type.icon}</Text>
          <Text style={styles.label}>{type.name}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 160,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'white',
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
});
