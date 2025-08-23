import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  MapPin,
  Camera,
  Clock,
  Users
} from 'lucide-react';

interface SubmissionStatusProps {
  isSubmitting: boolean;
  isSuccess: boolean;
  error?: string;
  onReset: () => void;
}

const submissionSteps = [
  {
    id: 'preparing',
    icon: Upload,
    title: 'Preparando reporte',
    description: 'Organizando información...',
    duration: 800
  },
  {
    id: 'uploading',
    icon: Camera,
    title: 'Subiendo imágenes',
    description: 'Procesando fotos...',
    duration: 1500
  },
  {
    id: 'locating',
    icon: MapPin,
    title: 'Verificando ubicación',
    description: 'Confirmando coordenadas...',
    duration: 600
  },
  {
    id: 'sending',
    icon: Send,
    title: 'Enviando reporte',
    description: 'Notificando a las autoridades...',
    duration: 1200
  },
  {
    id: 'success',
    icon: CheckCircle,
    title: 'Reporte enviado',
    description: '¡Gracias por ayudar!',
    duration: 2000
  }
];

export const SubmissionStatus: React.FC<SubmissionStatusProps> = ({
  isSubmitting,
  isSuccess,
  error,
  onReset
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isSubmitting && !isSuccess && !error) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    if (error) {
      return;
    }

    if (isSuccess) {
      setCurrentStep(submissionSteps.length - 1);
      setProgress(100);
      return;
    }

    if (isSubmitting) {
      let totalDuration = 0;
      let currentProgress = 0;
      
      const runSteps = async () => {
        for (let i = 0; i < submissionSteps.length - 1; i++) {
          setCurrentStep(i);
          
          const stepDuration = submissionSteps[i].duration;
          totalDuration += stepDuration;
          
          // Animate progress for current step
          const stepProgressIncrement = (100 / (submissionSteps.length - 1)) / (stepDuration / 50);
          
          for (let j = 0; j < stepDuration / 50; j++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            currentProgress += stepProgressIncrement;
            setProgress(currentProgress);
          }
        }
      };
      
      runSteps();
    }
  }, [isSubmitting, isSuccess, error]);

  const reset = () => {
    setCurrentStep(0);
    setProgress(0);
    onReset();
  };

  if (!isSubmitting && !isSuccess && !error) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="relative">
            {error ? (
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Error al enviar</h3>
                    <p className="text-red-100 text-sm">Algo salió mal</p>
                  </div>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-3 bg-white/20 rounded-2xl"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold">¡Reporte enviado!</h3>
                    <p className="text-green-100 text-sm">Gracias por contribuir</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                    className="p-3 bg-white/20 rounded-2xl"
                  >
                    {React.createElement(submissionSteps[currentStep]?.icon || Upload, { 
                      className: "w-6 h-6" 
                    })}
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold">Enviando reporte</h3>
                    <p className="text-blue-100 text-sm">Procesando información</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {!error && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {error ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-600 mb-2">{error}</p>
                  <p className="text-sm text-gray-500">
                    Por favor, intenta nuevamente o verifica tu conexión
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Intentar de nuevo
                </motion.button>
              </div>
            ) : isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>
                  
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    ¡Misión cumplida! 🎉
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Tu reporte ha sido recibido y será procesado por las autoridades competentes
                  </p>

                  {/* Success stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-blue-600 font-medium">Tiempo de respuesta</p>
                      <p className="text-sm font-bold text-blue-800">24-48h</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-green-600 font-medium">Comunidad activa</p>
                      <p className="text-sm font-bold text-green-800">+150 reportes</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Reportar otro problema
                </motion.button>
              </motion.div>
            ) : (
              <div className="text-center">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {submissionSteps[currentStep]?.title}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {submissionSteps[currentStep]?.description}
                  </p>
                </motion.div>

                {/* Step indicators */}
                <div className="flex justify-center space-x-2 mb-6">
                  {submissionSteps.slice(0, -1).map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index <= currentStep 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300'
                      }`}
                      animate={index === currentStep ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  ))}
                </div>

                <div className="text-xs text-gray-500">
                  Este proceso puede tomar unos segundos...
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
