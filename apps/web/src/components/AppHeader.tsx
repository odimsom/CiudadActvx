import React, { useState } from 'react';
import { MapPin, Menu, Bell } from 'lucide-react';
import { EmergencyPanel } from './EmergencyPanel';
import { StatisticsPanel } from './StatisticsPanel';
import { Notifications, Notification } from './Notifications';

interface AppHeaderProps {
  incidentCount?: number;
  mostrarHeatmap: boolean;
  onToggleHeatmap: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  incidentCount = 0,
  mostrarHeatmap,
  onToggleHeatmap,
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notification[]>([]);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Ciudad Activa</h1>
              <p className="text-xs text-gray-500">Reporta y mejora tu ciudad</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
            >
              <Bell className="w-5 h-5" />
              {incidentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {incidentCount > 99 ? '99+' : incidentCount}
                </span>
              )}
            </button>

            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-3 px-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium">
              💡 Toca cualquier punto del mapa para reportar una incidencia
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Mantén presionado para iniciar el reporte
            </p>
          </div>
        </div>

        {menuAbierto && (
          <div className="absolute top-16 right-4 w-64 bg-white shadow-xl border border-gray-200 rounded-lg z-50 p-4 space-y-3">
            <button
              onClick={onToggleHeatmap}
              className="w-full text-left px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 font-medium text-blue-700"
            >
              {mostrarHeatmap ? 'Ocultar Mapa de Calor' : 'Mostrar Mapa de Calor'}
            </button>

            <button
              onClick={() => {
                setStatsOpen(true);
                setMenuAbierto(false);
              }}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-gray-700"
            >
              Estadísticas
            </button>

            <button
              onClick={() => {
                setEmergencyOpen(true);
                setMenuAbierto(false);
              }}
              className="w-full text-left px-4 py-2 rounded hover:bg-red-100 text-red-700 font-semibold"
            >
              Estado de emergencia
            </button>
          </div>
        )}
      </div>

      <EmergencyPanel
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        onSubmit={(data) => {
          setNotificaciones(prev => [
            {
              id: crypto.randomUUID(),
              type: 'emergency',
              title: '🚨 Emergencia reportada',
              message: `${data.type === 'flood' ? 'Inundación' : 'Sismo'} en ${data.province}`,
              createdAt: new Date().toISOString(),
            },
            ...prev
          ]);
          alert('✅ ¡Gracias por reportar esta emergencia! Estamos tomando acciones.');
        }}
      />

      <StatisticsPanel open={statsOpen} onClose={() => setStatsOpen(false)} />

      <Notifications
        open={notificacionesAbiertas}
        onClose={() => setNotificacionesAbiertas(false)}
        notifications={notificaciones}
      />
    </header>
  );
};
