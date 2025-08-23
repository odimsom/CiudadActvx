import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Calendar, User, Eye,
  ThumbsUp, MessageCircle, Share2,
  AlertTriangle, CheckCircle2, Clock, Camera
} from 'lucide-react';
import {
  FaTrash, FaTools, FaShieldAlt, FaTree,
  FaCar, FaLightbulb, FaWater, FaVolumeMute
} from 'react-icons/fa';
import { IncidentReport } from '@ciudad-activa/types';
import { Button } from '@ciudad-activa/maps/components/ui/button';
import { useLocalImageStorage } from '../hooks/useLocalImageStorage';

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

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

const PRIORITY_COLORS = {
  low: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🟢' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟠' },
  urgent: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' },
};

interface IncidentDetailsPanelProps {
  incident: IncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentDetailsPanel: React.FC<IncidentDetailsPanelProps> = ({
  incident,
  isOpen,
  onClose
}) => {
  const { getImage } = useLocalImageStorage();
  
  // Función para obtener imágenes del localStorage usando las keys almacenadas
  const getImagesFromStorage = (photos: string[] | undefined) => {
    if (!photos || photos.length === 0) return [];
    
    return photos.map(photoKey => getImage(photoKey)).filter(Boolean) as string[];
  };
  if (!incident) return null;

  const IconComponent = CATEGORY_ICONS[incident.type.category as keyof typeof CATEGORY_ICONS];
  const statusStyle = STATUS_COLORS[incident.status];
  const priorityStyle = PRIORITY_COLORS[incident.priority];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  const getPriorityText = (priority: string) => {
    const priorityMap = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return priorityMap[priority as keyof typeof priorityMap] || priority;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 lg:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-0 right-0 max-h-[90vh] w-full max-w-md bg-white shadow-2xl z-50 rounded-t-2xl mx-auto flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-700/20" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Detalles de Incidencia</h2>
                    <p className="text-blue-100 text-sm opacity-90">{incident.type.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90"
                  aria-label="Cerrar panel de detalles"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido con scroll mejorado */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Status y priority badges */}
              <div className="flex gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border`}>
                  {incident.status === 'resolved' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {incident.status === 'in_progress' && <Clock className="w-3 h-3 inline mr-1" />}
                  {incident.status === 'pending' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                  {getStatusText(incident.status)}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                  {priorityStyle.icon} {getPriorityText(incident.priority)}
                </div>
              </div>

              {/* Título y descripción */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{incident.title}</h3>
                {incident.description && <p className="text-gray-600 leading-relaxed">{incident.description}</p>}
              </div>

              {/* Ubicación */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 mb-1">Ubicación</p>
                    <p className="text-sm text-gray-600">{incident.address || 'Dirección no disponible'}</p>
                    <p className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full inline-block mt-1">
                      {incident.coordinates.lat.toFixed(6)}, {incident.coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de fecha y usuario */}
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Reportado</p>
                    <p className="text-sm text-gray-600">{formatDate(incident.reportedAt)}</p>
                  </div>
                </div>

                {incident.updatedAt && incident.updatedAt !== incident.reportedAt && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Última actualización</p>
                      <p className="text-sm text-gray-600">{formatDate(incident.updatedAt)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Reportado por</p>
                    <p className="text-sm text-gray-600">{incident.reportedBy}</p>
                  </div>
                </div>
              </div>

              {/* Fotografías */}
              {(() => {
                const storedImages = getImagesFromStorage(incident.photos);
                const legacyImages = incident.images?.map(img => img.url) || [];
                const allImages = storedImages.length > 0 ? storedImages : legacyImages;
                
                return allImages.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Fotografías ({allImages.length})
                    </h4>
                    <div className="space-y-3">
                      {/* Imagen principal más grande */}
                      {allImages.slice(0, 1).map((photo, index) => (
                        <div key={index} className="relative group cursor-pointer">
                          <img
                            src={photo}
                            alt={`Fotografía principal del incidente`}
                            className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                            onClick={() => {
                              window.open(photo, '_blank');
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl flex items-center justify-center transition-all duration-300">
                            <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                              <Eye className="w-5 h-5 text-gray-800" />
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                            <span className="text-white text-xs font-medium">Click para ampliar</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Imágenes adicionales en grid si hay más de una */}
                      {allImages.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {allImages.slice(1).map((photo, index) => (
                            <div key={index + 1} className="relative group cursor-pointer">
                              <img
                                src={photo}
                                alt={`Fotografía ${index + 2} del incidente`}
                                className="w-full h-20 object-cover rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300"
                                onClick={() => {
                                  window.open(photo, '_blank');
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl flex items-center justify-center transition-all duration-300">
                                <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Estadísticas de interacción */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1"><Eye className="w-4 h-4" /><span>{incident.views || 0}</span></div>
                    <div className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /><span>{incident.votes || 0}</span></div>
                    <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /><span>{incident.notes?.length || 0}</span></div>
                  </div>
                  <button 
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                    aria-label="Compartir incidencia"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notas/Actualizaciones */}
              {incident.notes && incident.notes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Actualizaciones ({incident.notes.length})</h4>
                  <div className="space-y-3">
                    {incident.notes.slice(0, 3).map((note, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-sm text-gray-700">{note}</p>
                      </div>
                    ))}
                    {incident.notes.length > 3 && (
                      <button 
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                        aria-label="Ver todas las actualizaciones"
                      >
                        Ver todas las actualizaciones
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Espacio adicional para evitar que se corten los botones */}
              <div className="h-4"></div>
            </div>

            {/* Footer con botones - Posicionado fuera del scroll */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl text-sm py-2">
                    <ThumbsUp className="w-4 h-4 mr-2" /> Útil
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl text-sm py-2">
                    <Share2 className="w-4 h-4 mr-2" /> Compartir
                  </Button>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-sm py-2">
                  <Eye className="w-4 h-4 mr-2" /> Seguir Incidencia
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
