import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { SimpleServer } from '../utils/simpleServer';

interface RealtimeNotification {
  id: string;
  type: 'new_report' | 'update' | 'resolved';
  title: string;
  message: string;
  timestamp: Date;
  reportId?: string;
  location?: string;
}

export const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now() - 30000); // Permitir notificaciones de los últimos 30 segundos

  useEffect(() => {
    const server = SimpleServer.getInstance();
    
    // Escuchar cambios del servidor
    const unsubscribe = server.subscribe((incidents) => {
      const now = Date.now();
      
      // Buscar incidentes nuevos o actualizados desde la última verificación
      const recentIncidents = incidents.filter((incident: any) => {
        const updatedAt = new Date(incident.updatedAt).getTime();
        const reportedAt = new Date(incident.reportedAt).getTime();
        
        // Incluir si es nuevo o fue actualizado recientemente
        return updatedAt > lastUpdate || reportedAt > lastUpdate;
      });

      if (recentIncidents.length > 0) {
        const newNotifications = recentIncidents.map((incident: any) => {
          const isNewReport = new Date(incident.reportedAt).getTime() > (now - 15000); // Nuevo en los últimos 15 segundos
          const isResolved = incident.status === 'resolved';
          const isInProgress = incident.status === 'in_progress';
          
          let type: RealtimeNotification['type'] = 'update';
          let title = '🔄 Actualización';
          let message = `${incident.title} actualizado`;
          
          if (isNewReport) {
            type = 'new_report';
            title = '🆕 Nuevo reporte';
            message = `${incident.title} reportado en ${incident.address || 'ubicación desconocida'}`;
          } else if (isResolved) {
            type = 'resolved';
            title = '✅ Problema resuelto';
            message = `${incident.title} ha sido marcado como resuelto`;
          } else if (isInProgress) {
            title = '🔧 En progreso';
            message = `${incident.title} está siendo atendido`;
          }
          
          return {
            id: `${incident.id}-${now}-${Math.random()}`, // ID único para evitar duplicados
            type,
            title,
            message,
            timestamp: new Date(),
            reportId: incident.id,
            location: incident.address
          };
        });

        // Evitar notificaciones duplicadas
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.reportId));
          const filteredNew = newNotifications.filter(n => !existingIds.has(n.reportId));
          return [...filteredNew, ...prev].slice(0, 5);
        });
        
        setLastUpdate(now);
      }
    });

    return unsubscribe;
  }, [lastUpdate]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Auto-remover notificaciones después de 8 segundos
  useEffect(() => {
    const timers = notifications.map(notification => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, 8000);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  const getNotificationIcon = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'new_report':
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'update':
        return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getNotificationColor = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'new_report':
        return 'border-blue-200 bg-blue-50';
      case 'resolved':
        return 'border-green-200 bg-green-50';
      case 'update':
        return 'border-orange-200 bg-orange-50';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`bg-white border-2 rounded-xl p-4 shadow-lg backdrop-blur-sm ${getNotificationColor(notification.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    {notification.title}
                  </h4>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {notification.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {notification.location && (
                    <span className="text-xs text-gray-500 truncate max-w-32" title={notification.location}>
                      📍 {notification.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Barra de progreso para mostrar tiempo restante */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-b-xl"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Indicador de conexión en tiempo real */}
      {notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Conectado en tiempo real</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
