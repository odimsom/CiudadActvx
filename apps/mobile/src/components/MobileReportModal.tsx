import React, { useState, useRef } from 'react';
import { 
  X, MapPin, Camera, Image as ImageIcon, 
  Send, AlertTriangle, CheckCircle,
  MapPinIcon, Loader2, ChevronDown
} from 'lucide-react';
import { CreateIncidentData, IncidentPriority, Coordinates } from '@ciudad-activa/types';
import { CompactTypeSelector } from './CompactTypeSelector';

interface MobileReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates?: Coordinates | null;
  onSubmit: (data: CreateIncidentData) => void;
  userLocation?: Coordinates | null;
}

const INCIDENT_TYPES = [
  { id: 'waste', name: 'Basura', emoji: '🗑️', color: '#ef4444' },
  { id: 'pothole', name: 'Bache', emoji: '🕳️', color: '#f59e0b' },
  { id: 'lighting', name: 'Iluminación', emoji: '💡', color: '#fbbf24' },
  { id: 'water', name: 'Agua', emoji: '💧', color: '#3b82f6' },
  { id: 'trees', name: 'Árboles', emoji: '🌳', color: '#16a34a' },
  { id: 'traffic', name: 'Tráfico', emoji: '🚦', color: '#dc2626' },
  { id: 'noise', name: 'Ruido', emoji: '🔊', color: '#9333ea' },
  { id: 'safety', name: 'Seguridad', emoji: '🚨', color: '#c2410c' },
  { id: 'other', name: 'Otro', emoji: '❓', color: '#6b7280' },
];

export const MobileReportModal: React.FC<MobileReportModalProps> = ({
  isOpen,
  onClose,
  coordinates,
  onSubmit,
  userLocation
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setSelectedType('');
    setTitle('');
    setDescription('');
    setPhotos([]);
    setCurrentStep(1);
    setUseCurrentLocation(false);
    setShowTypeSelector(false);
    onClose();
  };

  const handlePhotoSelection = (source: 'camera' | 'gallery') => {
    if (source === 'camera') {
      cameraInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length + photos.length > 3) {
      alert('Máximo 3 fotos permitidas');
      return;
    }
    
    setPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title.trim()) return;

    setIsSubmitting(true);

    const selectedTypeData = INCIDENT_TYPES.find(t => t.id === selectedType);
    const reportCoords = useCurrentLocation && userLocation ? userLocation : coordinates;
    
    if (!reportCoords) {
      alert('No se pudo obtener la ubicación');
      setIsSubmitting(false);
      return;
    }

    const formData: CreateIncidentData = {
      typeId: selectedType,
      typeName: selectedTypeData?.name || 'Incidencia',
      typeIcon: selectedTypeData?.emoji || '📍',
      typeColor: selectedTypeData?.color || '#6b7280',
      typeCategory: selectedType,
      title: title.trim(),
      description: description.trim() || undefined,
      latitude: reportCoords.lat,
      longitude: reportCoords.lng,
      priority: IncidentPriority.MEDIUM,
      reportedBy: 'usuario-movil'
    };

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error al enviar reporte:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[9999] backdrop-blur-sm">
      <div className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden transform transition-all duration-300 translate-y-0">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-2xl">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Reportar Problema</h2>
                <p className="text-blue-100 text-sm">Paso {currentStep} de 3</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-2xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Paso 1: Tipo de problema - Mejorado */}
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <h3 className="text-lg font-semibold mb-6 text-center">
                  ¿Qué problema observas? 👀
                </h3>
                
                {/* Botón para abrir selector compacto */}
                <button
                  type="button"
                  onClick={() => setShowTypeSelector(true)}
                  className={`w-full p-6 rounded-2xl border-2 border-dashed transition-all duration-200 ${
                    selectedType 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  {selectedType ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">
                        {INCIDENT_TYPES.find(t => t.id === selectedType)?.emoji}
                      </span>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">
                          {INCIDENT_TYPES.find(t => t.id === selectedType)?.name}
                        </div>
                        <div className="text-sm text-blue-600">Toca para cambiar</div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🤔</div>
                      <div className="font-semibold text-gray-700 mb-1">
                        Seleccionar tipo de problema
                      </div>
                      <div className="text-sm text-gray-500">
                        Toca aquí para elegir
                      </div>
                    </div>
                  )}
                </button>

                {/* Botón continuar */}
                {selectedType && (
                  <div className="mt-6 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Continuar →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Paso 2: Descripción y ubicación */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Cuéntanos más detalles 📝
                </h3>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Título del reporte *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Bache grande en la calle"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={80}
                    required
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {title.length}/80
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe qué observas..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {description.length}/200
                  </div>
                </div>

                {/* Ubicación */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-blue-500" />
                    Ubicación del problema
                  </h4>
                  
                  {userLocation && (
                    <label className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={useCurrentLocation}
                        onChange={(e) => setUseCurrentLocation(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Usar mi ubicación actual 📍
                      </span>
                    </label>
                  )}
                  
                  <div className="text-xs text-gray-500 bg-white rounded-lg p-3">
                    {useCurrentLocation && userLocation ? (
                      <>
                        📍 Tu ubicación actual
                        <br />
                        <span className="font-mono">
                          {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </span>
                      </>
                    ) : coordinates ? (
                      <>
                        📍 Ubicación seleccionada en el mapa
                        <br />
                        <span className="font-mono">
                          {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                        </span>
                      </>
                    ) : (
                      '❌ No hay ubicación seleccionada'
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!title.trim()}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3: Fotos */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Agrega fotos (opcional) 📸
                </h3>

                {/* Opciones de cámara */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handlePhotoSelection('camera')}
                    className="flex flex-col items-center p-6 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-blue-700">
                      Tomar Foto
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePhotoSelection('gallery')}
                    className="flex flex-col items-center p-6 border-2 border-dashed border-purple-300 rounded-xl hover:bg-purple-50 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-purple-700">
                      Desde Galería
                    </span>
                  </button>
                </div>

                {/* Input ocultos para archivos */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Preview de fotos */}
                {photos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      Fotos seleccionadas ({photos.length}/3)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Reporte
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Selector compacto de tipos */}
      <CompactTypeSelector
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelect={(typeId) => {
          setSelectedType(typeId);
          setShowTypeSelector(false);
        }}
        selectedType={selectedType}
      />
    </div>
  );
};
