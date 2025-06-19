import React from 'react';
import { MapPin, Menu, Bell } from 'lucide-react';

interface AppHeaderProps {
  incidentCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ incidentCount = 0 }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Ciudad Activa</h1>
              <p className="text-xs text-gray-500">Reporta y mejora tu ciudad</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Notificaciones */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {incidentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {incidentCount > 99 ? '99+' : incidentCount}
                </span>
              )}
            </button>

            {/* Menú */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instrucciones */}
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
      </div>
    </header>
  );
};
