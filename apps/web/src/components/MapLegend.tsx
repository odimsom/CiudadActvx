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
  { id: 'waste', name: 'Limpieza', emoji: '🗑️', color: '#ef4444', icon: FaTrash, description: 'Basura acumulada, contenedores' },
  { id: 'infrastructure', name: 'Infraestructura', emoji: '🔧', color: '#f59e0b', icon: FaTools, description: 'Baches, aceras, mobiliario' },
  { id: 'lighting', name: 'Iluminación', emoji: '💡', color: '#fbbf24', icon: FaLightbulb, description: 'Alumbrado público, semáforos' },
  { id: 'transport', name: 'Transporte', emoji: '🚗', color: '#2563eb', icon: FaCar, description: 'Tráfico, señalización vial' },
  { id: 'environment', name: 'Medio Ambiente', emoji: '🌳', color: '#16a34a', icon: FaTree, description: 'Árboles, espacios verdes' },
  { id: 'safety', name: 'Seguridad', emoji: '🛡️', color: '#dc2626', icon: FaShieldAlt, description: 'Vandalismo, seguridad' },
  { id: 'water', name: 'Agua', emoji: '💧', color: '#0ea5e9', icon: FaWater, description: 'Fugas, alcantarillado' },
  { id: 'noise', name: 'Ruido', emoji: '🔇', color: '#7c3aed', icon: FaVolumeMute, description: 'Contaminación sonora' }
];

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newActiveCategories = new Set(activeCategories);
    if (newActiveCategories.has(categoryId)) {
      newActiveCategories.delete(categoryId);
    } else {
      newActiveCategories.add(categoryId);
    }
    setActiveCategories(newActiveCategories);
  };

  return (
    <>
      {/* Versión Desktop - Horizontal en la parte inferior */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 hidden md:block"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Toggle button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaInfoCircle className="w-4 h-4" />
            <span className="font-medium text-sm">
              {isExpanded ? 'Ocultar Leyenda' : 'Mostrar Leyenda'}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaEye className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* Horizontal Legend Categories */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4"
              >
                <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl">
                  {LEGEND_CATEGORIES.map((category, index) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleCategory(category.id)}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 border-2 hover:shadow-lg ${
                        activeCategories.has(category.id)
                          ? 'border-transparent shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: activeCategories.has(category.id) 
                          ? `${category.color}15` 
                          : 'white'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`p-1.5 rounded-lg text-white shadow-sm group-hover:shadow-md transition-all duration-300 ${
                          activeCategories.has(category.id) ? 'scale-110' : ''
                        }`}
                        style={{ backgroundColor: category.color }}
                      >
                        <category.icon className="w-3 h-3" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-semibold text-gray-700 block leading-tight">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {category.emoji}
                        </span>
                      </div>
                      {activeCategories.has(category.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-1"
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    <span className="font-medium">Consejo:</span> Mantén presionado sobre el mapa para reportar un problema 
                    • <span className="text-blue-600">{activeCategories.size} categoría(s) seleccionada(s)</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Versión Mobile - Vertical compacta en la izquierda */}
      <motion.div
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 md:hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        {/* Botón toggle compacto */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group mb-2 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <FaEyeSlash className="w-4 h-4 text-gray-600 group-hover:text-blue-500" />
            ) : (
              <FaEye className="w-4 h-4 text-gray-600 group-hover:text-blue-500" />
            )}
            {!isExpanded && (
              <div className="flex -space-x-1">
                {LEGEND_CATEGORIES.slice(0, 3).map((category, index) => (
                  <div
                    key={category.id}
                    className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: category.color, zIndex: 10 - index }}
                  >
                    <category.icon className="w-2.5 h-2.5 text-white" />
                  </div>
                ))}
                <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white font-bold text-xs">
                  +{LEGEND_CATEGORIES.length - 3}
                </div>
              </div>
            )}
          </div>
        </motion.button>

        {/* Panel expandido móvil */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden max-w-xs"
            >
              {/* Header compacto */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 text-white">
                <h3 className="font-semibold text-sm">Tipos de Problemas</h3>
                <p className="text-xs text-blue-100 opacity-90">
                  Toca para activar filtros
                </p>
              </div>

              {/* Lista de categorías compacta */}
              <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                {LEGEND_CATEGORIES.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all group border-2 ${
                      activeCategories.has(category.id)
                        ? 'border-transparent shadow-md'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    style={{
                      backgroundColor: activeCategories.has(category.id) 
                        ? `${category.color}15` 
                        : 'white'
                    }}
                  >
                    <div
                      className="p-1.5 rounded-lg text-white shadow-sm group-hover:shadow-md transition-shadow"
                      style={{ backgroundColor: category.color }}
                    >
                      <category.icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-xs text-gray-800">
                          {category.name}
                        </span>
                        <span className="text-sm">{category.emoji}</span>
                      </div>
                    </div>
                    {activeCategories.has(category.id) && (
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-gray-50/80 px-3 py-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  {activeCategories.size > 0 ? (
                    <span className="text-blue-600 font-medium">
                      {activeCategories.size} filtro(s) activo(s)
                    </span>
                  ) : (
                    'Mantén pulsado en el mapa para reportar'
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
