import React, { useState, useEffect } from 'react';
import { 
  X, ArrowRight, ArrowLeft, Camera, 
  MapPin, Send, CheckCircle, Hand,
  Smartphone, Eye, Star
} from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tutorials: Tutorial[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Ciudad Activa! 👋',
    description: 'Tu voz importa. Con esta app puedes reportar problemas en tu ciudad y ayudar a mejorarla para todos.',
    icon: <Star className="w-8 h-8 text-yellow-500" />
  },
  {
    id: 'location',
    title: 'Encuentra el problema 📍',
    description: 'Puedes reportar desde donde estés o tocar cualquier punto en el mapa. ¡Usamos tu ubicación para ser más precisos!',
    icon: <MapPin className="w-8 h-8 text-blue-500" />
  },
  {
    id: 'photo',
    title: 'Toma una foto 📸',
    description: 'Una imagen vale más que mil palabras. Usa tu cámara o selecciona desde tu galería. ¡Las fotos ayudan mucho!',
    icon: <Camera className="w-8 h-8 text-purple-500" />
  },
  {
    id: 'report',
    title: 'Describe el problema ✏️',
    description: 'Cuéntanos qué observas. Selecciona el tipo de problema y agrega una breve descripción.',
    icon: <Send className="w-8 h-8 text-green-500" />
  },
  {
    id: 'community',
    title: 'Ayuda a tu comunidad 🤝',
    description: 'Tu reporte llegará a las autoridades y será visible para otros ciudadanos. ¡Juntos construimos una mejor ciudad!',
    icon: <CheckCircle className="w-8 h-8 text-emerald-500" />
  }
];

interface MobileTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const MobileTutorial: React.FC<MobileTutorialProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorials.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    setCurrentStep(0);
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
  };

  if (!isOpen) return null;

  const currentTutorial = tutorials[currentStep];
  const isLastStep = currentStep === tutorials.length - 1;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/95 to-purple-900/95 z-[10000] flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 relative overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 text-center">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex justify-center gap-2">
              {tutorials.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-blue-100 text-sm mt-2">
              {currentStep + 1} de {tutorials.length}
            </p>
          </div>

          {/* Icon */}
          <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
            {currentTutorial.icon}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            {currentTutorial.title}
          </h2>
          
          <p className="text-gray-600 text-center leading-relaxed mb-6">
            {currentTutorial.description}
          </p>

          {/* Demo visual según el paso */}
          <div className="mb-6">
            {currentStep === 1 && (
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="inline-block animate-bounce">
                  <Hand className="w-12 h-12 text-blue-500 mx-auto" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Toca cualquier parte del mapa
                </p>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="inline-block animate-pulse">
                  <Smartphone className="w-12 h-12 text-purple-500 mx-auto" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Cámara o galería, tú eliges
                </p>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 text-center">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['🗑️', '🕳️', '💡'].map((emoji, i) => (
                    <div
                      key={i}
                      className="bg-white p-2 rounded-lg text-lg transform hover:scale-105 transition-transform"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Tipos de problemas disponibles
                </p>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  ¡Tu reporte ayuda a toda la comunidad!
                </p>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            )}
            
            <button
              onClick={handleNext}
              className={`${currentStep > 0 ? 'flex-1' : 'w-full'} py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all transform hover:scale-105`}
            >
              {isLastStep ? '¡Empezar!' : 'Siguiente'}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Skip button */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Saltar tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
