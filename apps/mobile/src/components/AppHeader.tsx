import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface AppHeaderProps {
  onToggleLegend: () => void;
  onCenterLocation: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: (show: boolean) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleLegend,
  onCenterLocation,
  showHeatmap,
  onToggleHeatmap,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        {/* Logo y título */}
        <View style={styles.titleContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <View>
            <Text style={styles.title}>Ciudad Activa</Text>
            <Text style={styles.subtitle}>Reporta y mejora tu ciudad</Text>
          </View>
        </View>

        {/* Controles */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, showHeatmap && styles.activeButton]}
            onPress={() => onToggleHeatmap(!showHeatmap)}
          >
            <Text style={[styles.controlText, showHeatmap && styles.activeText]}>
              🔥
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={onToggleLegend}
          >
            <Text style={styles.controlText}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  controlText: {
    fontSize: 16,
  },
  activeText: {
    color: 'white',
  },
});
