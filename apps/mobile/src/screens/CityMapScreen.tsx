import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Text,
  Animated,
  PanResponder,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useIncidents } from '../hooks/useIncidents';
import { Coordinates, IncidentReport, CreateIncidentData } from '@ciudad-activa/types';
import { IncidentFormModal } from '../components/IncidentFormModal';
import { IncidentDetailsPanel } from '../components/IncidentDetailsPanel';
import { MapLegend } from '../components/MapLegend';
import { AppHeader } from '../components/AppHeader';
import { RealtimeNotifications } from '../components/RealtimeNotifications';

const { width, height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 25.6866, // Monterrey, México
  longitude: -100.3161,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const CityMapScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const { incidents, createIncident } = useIncidents();

  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Animaciones
  const panelAnimation = useRef(new Animated.Value(0)).current;
  const legendAnimation = useRef(new Animated.Value(1)).current;

  // Manejo de long press para crear incidentes
  const handleMapLongPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedCoordinates({ lat: latitude, lng: longitude });
    setIsFormModalOpen(true);
  };

  // Manejo de selección de marcadores
  const handleMarkerPress = (incident: IncidentReport) => {
    setSelectedIncident(incident);
    setIsDetailsPanelOpen(true);
    
    // Animar el panel hacia arriba
    Animated.spring(panelAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Crear nuevo incidente
  const handleCreateIncident = async (data: CreateIncidentData) => {
    if (!selectedCoordinates) return;

    try {
      await createIncident({
        ...data,
        coordinates: selectedCoordinates,
      });
      setIsFormModalOpen(false);
      setSelectedCoordinates(null);
      Alert.alert('Éxito', 'Incidente reportado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo reportar el incidente');
    }
  };

  // Cerrar panel de detalles
  const closeDetailsPanel = () => {
    Animated.spring(panelAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setIsDetailsPanelOpen(false);
      setSelectedIncident(null);
    });
  };

  // Toggle legend
  const toggleLegend = () => {
    const toValue = showLegend ? 0 : 1;
    setShowLegend(!showLegend);
    
    Animated.spring(legendAnimation, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  // Centrar mapa en ubicación actual
  const centerOnUserLocation = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(INITIAL_REGION, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader
        onToggleLegend={toggleLegend}
        onCenterLocation={centerOnUserLocation}
        showHeatmap={showHeatmap}
        onToggleHeatmap={setShowHeatmap}
      />

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        onLongPress={handleMapLongPress}
        showsUserLocation
        showsMyLocationButton={false}
        mapType={showHeatmap ? 'satellite' : 'standard'}
      >
        {/* Marcadores de incidentes */}
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: incident.coordinates.lat,
              longitude: incident.coordinates.lng,
            }}
            onPress={() => handleMarkerPress(incident)}
          >
            <View style={[
              styles.marker,
              { backgroundColor: incident.type.color }
            ]}>
              <Text style={styles.markerText}>
                {incident.type.icon}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Leyenda */}
      <Animated.View
        style={[
          styles.legendContainer,
          {
            opacity: legendAnimation,
            transform: [{
              translateY: legendAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            }],
          },
        ]}
      >
        <MapLegend />
      </Animated.View>

      {/* Botón de ubicación */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={centerOnUserLocation}
      >
        <Text style={styles.locationButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Botón de estadísticas */}
      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => Alert.alert('Estadísticas', `${incidents.length} incidentes reportados`)}
      >
        <Text style={styles.statsButtonText}>📊</Text>
      </TouchableOpacity>

      {/* Panel de detalles */}
      {isDetailsPanelOpen && selectedIncident && (
        <Animated.View
          style={[
            styles.detailsPanel,
            {
              transform: [{
                translateY: panelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              }],
            },
          ]}
        >
          <IncidentDetailsPanel
            incident={selectedIncident}
            onClose={closeDetailsPanel}
          />
        </Animated.View>
      )}

      {/* Modal de formulario */}
      <IncidentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCoordinates(null);
        }}
        onSubmit={handleCreateIncident}
        coordinates={selectedCoordinates}
      />

      {/* Notificaciones en tiempo real */}
      <RealtimeNotifications />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff0000',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  legendContainer: {
    position: 'absolute',
    top: 80,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButtonText: {
    fontSize: 20,
    color: 'white',
  },
  statsButton: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsButtonText: {
    fontSize: 20,
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
