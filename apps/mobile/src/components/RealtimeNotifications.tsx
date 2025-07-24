import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    // Simular notificaciones en tiempo real
    const interval = setInterval(() => {
      const messages = [
        { message: '🚧 Nuevo reporte de bache en Av. Constitución', type: 'info' as const },
        { message: '✅ Problema de alumbrado resuelto en Col. Centro', type: 'success' as const },
        { message: '⚠️ Múltiples reportes de semáforo dañado', type: 'warning' as const },
        { message: '🔧 Equipo de mantenimiento en ruta', type: 'info' as const },
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...randomMessage,
        duration: 4000,
      };

      showNotification(newNotification);
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const showNotification = (notification: Notification) => {
    setNotifications(prev => [...prev, notification]);

    // Animar entrada
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(notification.duration || 3000),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remover notificación después de la animación
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    });
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {notifications.map((notification, index) => (
        <Animated.View
          key={notification.id}
          style={[
            styles.notification,
            {
              backgroundColor: getNotificationColor(notification.type),
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
              opacity: animatedValue,
            },
          ]}
        >
          <Text style={styles.notificationText} numberOfLines={2}>
            {notification.message}
          </Text>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => dismissNotification(notification.id)}
          >
            <Text style={styles.dismissButtonText}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
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
  notificationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
