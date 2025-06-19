import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrash, 
  FaTools, 
  FaShieldAlt, 
  FaTree, 
  FaCar, 
  FaLightbulb,
  FaWater,
  FaVolumeMute,
  FaEye,
  FaEyeSlash,
  FaInfoCircle
} from 'react-icons/fa';

// Categorías de incidencias con iconos coloridos
const LEGEND_CATEGORIES = [
  {
    id: 'waste',
    name: 'Limpieza',
    emoji: '🗑️',
    color: '#ef4444',
    icon: FaTrash,
    description: 'Basura acumulada, contenedores'
  },
  {
    id: 'infrastructure',
    name: 'Infraestructura',
    emoji: '🔧',
    color: '#f59e0b',
    icon: FaTools,
    description: 'Baches, aceras, mobiliario'
  },
  {
    id: 'lighting',
    name: 'Iluminación',
    emoji: '💡',
    color: '#fbbf24',
    icon: FaLightbulb,
    description: 'Alumbrado público, semáforos'
  },
  {
    id: 'transport',
    name: 'Transporte',
    emoji: '🚗',
    color: '#2563eb',
    icon: FaCar,
    description: 'Tráfico, señalización vial'
  },
  {
    id: 'environment',
    name: 'Medio Ambiente',
    emoji: '🌳',
    color: '#16a34a',
    icon: FaTree,
    description: 'Árboles, espacios verdes'
  },
  {
    id: 'safety',
    name: 'Seguridad',
    emoji: '🛡️',
    color: '#dc2626',
    icon: FaShieldAlt,
    description: 'Vandalismo, seguridad'
  },
  {
    id: 'water',
    name: 'Agua',
    emoji: '💧',
    color: '#0ea5e9',
    icon: FaWater,
    description: 'Fugas, alcantarillado'
  },
  {
    id: 'noise',
    name: 'Ruido',
    emoji: '🔇',
    color: '#7c3aed',
    icon: FaVolumeMute,
    description: 'Contaminación sonora'
  }
];

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      {/* Botón de toggle */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group mb-2 p-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <FaEyeSlash className="w-5 h-5 text-gray-600 group-hover:text-blue-500" />
          ) : (
            <FaEye className="w-5 h-5 text-gray-600 group-hover:text-blue-500" />
          )}
          {!isExpanded && (
            <div className="flex -space-x-1">
              {LEGEND_CATEGORIES.slice(0, 4).map((category, index) => (
                <div
                  key={category.id}
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs"
                  style={{ backgroundColor: category.color, zIndex: 10 - index }}
                >
                  <category.icon className="w-3 h-3 text-white" />
                </div>
              ))}
              {LEGEND_CATEGORIES.length > 4 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs text-white font-bold">
                  +{LEGEND_CATEGORIES.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.button>

      {/* Panel expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-w-sm"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="w-4 h-4" />
                <h3 className="font-bold text-sm">Tipos de Incidencias</h3>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Haz clic largo en el mapa para reportar
              </p>
            </div>

            {/* Lista de categorías */}
            <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
              {LEGEND_CATEGORIES.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                >
                  {/* Icono */}
                  <div
                    className="p-2 rounded-xl text-white shadow-md group-hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: category.color }}
                  >
                    <category.icon className="w-4 h-4" />
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">
                        {category.name}
                      </span>
                      <span className="text-base">{category.emoji}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Indicador visual */}
                  <div
                    className="w-2 h-8 rounded-full opacity-30 group-hover:opacity-60 transition-opacity"
                    style={{ backgroundColor: category.color }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t">
              <p className="text-xs text-gray-500 text-center">
                👆 Mantén pulsado para activar el sonar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
