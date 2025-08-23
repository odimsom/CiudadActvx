import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, Eye, Zap, Globe, CheckCircle } from 'lucide-react';

interface ImprovedLoadingStateProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

const loadingSteps = [
  {
    icon: Globe,
    title: "Conectando con la ciudad...",
    description: "Estableciendo conexión",
    color: "#3b82f6"
  },
  {
    icon: MapPin,
    title: "Cargando ubicaciones...",
    description: "Obteniendo datos del mapa",
    color: "#10b981"
  },
  {
    icon: Camera,
    title: "Preparando herramientas...",
    description: "Sistema de reportes listo",
    color: "#f59e0b"
  },
  {
    icon: Eye,
    title: "¡Listo para explorar!",
    description: "Ciudad Activa activada",
    color: "#8b5cf6"
  }
];

export const ImprovedLoadingState: React.FC<ImprovedLoadingStateProps> = ({
  isLoading,
  message = "Cargando...",
  progress = 0
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setDisplayProgress(0);
      return;
    }

    // Animar progreso
    const progressInterval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev >= progress) {
          clearInterval(progressInterval);
          return progress;
        }
        return prev + 2;
      });
    }, 50);

    // Cambiar paso basado en progreso
    const step = Math.min(Math.floor((displayProgress / 100) * loadingSteps.length), loadingSteps.length - 1);
    setCurrentStep(step);

    return () => clearInterval(progressInterval);
  }, [isLoading, progress, displayProgress]);

  if (!isLoading) return null;

  const currentStepData = loadingSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center"
      >
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full animate-pulse" />
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-purple-200/30 rounded-full animate-pulse" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-200/30 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-yellow-200/30 rounded-full animate-pulse" />
        </div>

        <div className="relative max-w-md w-full mx-4">
          {/* Logo/Branding */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
              <motion.div
                animate={{ 
                  rotate: displayProgress * 3.6,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 0.1 },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <Zap className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ciudad Activa
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Conectando con tu comunidad
            </p>
          </motion.div>

          {/* Paso actual */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${currentStepData.color}15` }}
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  `0 4px 20px ${currentStepData.color}30`,
                  `0 8px 30px ${currentStepData.color}40`,
                  `0 4px 20px ${currentStepData.color}30`
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <currentStepData.icon 
                className="w-8 h-8" 
                style={{ color: currentStepData.color }}
              />
            </motion.div>
            
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-sm text-gray-600">
              {currentStepData.description}
            </p>
          </motion.div>

          {/* Barra de progreso mejorada */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {message}
              </span>
              <span className="text-sm font-bold text-blue-600">
                {Math.round(displayProgress)}%
              </span>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
                style={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </div>

          {/* Indicadores de paso */}
          <div className="flex justify-center space-x-2">
            {loadingSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gray-300'
                }`}
                animate={index === currentStep ? {
                  scale: [1, 1.3, 1],
                } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Mensaje de consejo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-medium">
                  {displayProgress < 25 && "Conectando con los servidores..."}
                  {displayProgress >= 25 && displayProgress < 50 && "Cargando datos en tiempo real..."}
                  {displayProgress >= 50 && displayProgress < 75 && "Preparando la experiencia interactiva..."}
                  {displayProgress >= 75 && "¡Casi listo para reportar problemas!"}
                </span>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Completado */}
          {displayProgress >= 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  ¡Listo para comenzar!
                </h3>
                <p className="text-sm text-gray-600">
                  Tu ciudad te espera 🏙️
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
