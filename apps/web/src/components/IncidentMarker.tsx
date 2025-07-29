import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaTrash, 
  FaTools, 
  FaShieldAlt, 
  FaTree, 
  FaCar, 
  FaLightbulb,
  FaWater,
  FaVolumeMute
} from 'react-icons/fa';
import { IncidentReport } from '@ciudad-activa/types';

// Mapeo de iconos por categoría
const CATEGORY_ICONS = {
  waste: FaTrash,
  infrastructure: FaTools,
  lighting: FaLightbulb,
  transport: FaCar,
  environment: FaTree,
  safety: FaShieldAlt,
  water: FaWater,
  noise: FaVolumeMute,
};

// Colores por categoría
const CATEGORY_COLORS = {
  waste: '#ef4444',
  infrastructure: '#f59e0b',
  lighting: '#fbbf24',
  transport: '#2563eb',
  environment: '#16a34a',
  safety: '#dc2626',
  water: '#0ea5e9',
  noise: '#7c3aed',
};

// Colores por estado
const STATUS_COLORS = {
  pending: '#f59e0b',
  in_progress: '#2563eb',
  resolved: '#16a34a',
  rejected: '#ef4444',
};

interface IncidentMarkerProps {
  incident: IncidentReport;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const IncidentMarker: React.FC<IncidentMarkerProps> = ({
  incident,
  isSelected = false,
  onClick,
  size = 'medium'
}) => {
  const IconComponent = CATEGORY_ICONS[incident.type.category as keyof typeof CATEGORY_ICONS];
  const categoryColor = CATEGORY_COLORS[incident.type.category as keyof typeof CATEGORY_COLORS];
  const statusColor = STATUS_COLORS[incident.status];

  // Debug log para verificar colores
  console.log("🔴 IncidentMarker - incident:", incident.id);
  console.log("🔴 Category:", incident.type.category);
  console.log("🔴 Color from type:", incident.type.color);
  console.log("🔴 Category color from constants:", categoryColor);
  console.log("🔴 Color final a usar:", incident.type.color || categoryColor || '#6b7280');

  const finalColor = incident.type.color || categoryColor || '#6b7280';

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-5 h-5',
    large: 'w-7 h-7'
  };

  return (
    <div className="incident-marker-wrapper fixed pointer-events-auto z-10">
      <motion.button
        onClick={onClick}
        className={`${sizeClasses[size]} relative cursor-pointer group`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isSelected ? { scale: 1.2 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Sombra base */}
        <div 
          className="absolute inset-0 rounded-full shadow-lg opacity-30"
          style={{ backgroundColor: finalColor }}
        />
        
        {/* Anillo de estado */}
        <motion.div
          className="absolute inset-0 rounded-full border-3"
          style={{ borderColor: statusColor }}
          animate={isSelected ? { 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7] 
          } : {}}
          transition={{ 
            duration: 2, 
            repeat: isSelected ? Infinity : 0,
            ease: 'easeInOut'
          }}
        />

        {/* Círculo principal */}
        <div 
          className="absolute inset-1 rounded-full shadow-xl flex items-center justify-center text-white font-bold"
          style={{ 
            backgroundColor: finalColor,
            boxShadow: `0 4px 15px ${finalColor}40, 0 0 20px ${finalColor}20`
          }}
        >
          {IconComponent && <IconComponent className={`${iconSizes[size]} drop-shadow-sm`} />}
        </div>

        {/* Indicador de prioridad */}
        {incident.priority === 'urgent' && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            animate={{ 
              scale: [1, 1.3, 1],
              backgroundColor: ['#ef4444', '#fbbf24', '#ef4444']
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <span className="text-white text-xs font-bold">!</span>
          </motion.div>
        )}

        {/* Pulso de actividad para incidencias nuevas */}
        {new Date().getTime() - incident.reportedAt.getTime() < 24 * 60 * 60 * 1000 && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Tooltip mejorado */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs relative">
            <div className="font-semibold mb-1">{incident.title}</div>
            <div className="text-gray-300 text-xs">
              {incident.type.name} • {getStatusText(incident.status)}
            </div>
            {incident.description && (
              <div className="text-gray-400 text-xs mt-1 line-clamp-2">
                {incident.description.substring(0, 60)}...
              </div>
            )}
            {/* Flecha del tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>

        {/* Contador de votos/visualizaciones */}
        {(incident.votes && incident.votes > 0) && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-0.5 text-xs font-bold text-gray-700 shadow-md border">
            👍 {incident.votes}
          </div>
        )}
      </motion.button>
    </div>
  );
};

const getStatusText = (status: string) => {
  const statusMap = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    resolved: 'Resuelto',
    rejected: 'Rechazado'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};
