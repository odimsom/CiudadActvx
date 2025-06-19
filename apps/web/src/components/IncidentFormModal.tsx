import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent
} from '@ciudad-activa/maps/components/ui/dialog';
import { Button } from '@ciudad-activa/maps/components/ui/button';
import { 
  MapPin,
  Send,
  X
} from 'lucide-react';
// Importar iconos más atractivos de react-icons
import { 
  FaTrash, 
  FaTools, 
  FaShieldAlt, 
  FaTree, 
  FaCar, 
  FaLightbulb,
  FaWater,
  FaVolumeMute,
  FaImage
} from 'react-icons/fa';
import { CreateIncidentData, IncidentPriority, Coordinates } from '@ciudad-activa/types';

// Categorías mejoradas con iconos más atractivos
const INCIDENT_CATEGORIES = [
  {
    id: 'waste',
    name: 'Limpieza',
    emoji: '🗑️',
    color: '#ef4444',
    icon: FaTrash,
    description: 'Problemas de basura y limpieza'
  },
  {
    id: 'infrastructure',
    name: 'Infraestructura',
    emoji: '🔧',
    color: '#f59e0b',
    icon: FaTools,
    description: 'Daños en calles, aceras, etc.'
  },
  {
    id: 'lighting',
    name: 'Iluminación',
    emoji: '💡',
    color: '#fbbf24',
    icon: FaLightbulb,
    description: 'Problemas de alumbrado público'
  },
  {
    id: 'transport',
    name: 'Transporte',
    emoji: '🚗',
    color: '#2563eb',
    icon: FaCar,
    description: 'Problemas de tráfico y transporte'
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
    description: 'Vandalismo, seguridad pública'
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

interface IncidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: Coordinates;
  onSubmit: (data: CreateIncidentData) => void;
}

export const IncidentFormModal: React.FC<IncidentFormModalProps> = ({
  isOpen,
  onClose,
  coordinates,
  onSubmit
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !title.trim()) return;

    onSubmit({
      typeId: selectedCategory,
      title: title.trim(),
      description: description.trim() || undefined,
      coordinates,
      priority: IncidentPriority.MEDIUM,
    });

    // Reset form
    handleClose();
  };

  const handleClose = () => {
    setSelectedCategory('');
    setTitle('');
    setDescription('');
    setImages([]);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 3)); // Máximo 3 imágenes
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0 max-h-[85vh]">
        {/* Header más amigable con bordes suaves */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-700/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Reportar Problema</h2>
                <p className="text-blue-100 text-sm opacity-90">
                  Ayúdanos a mejorar la ciudad 🏙️
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-2xl transition-all duration-200 hover:rotate-45"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Ubicación */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Ubicación:</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full shadow-sm">
                  {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </span>
              </div>
            </motion.div>

            {/* Categoría */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-semibold mb-4 text-gray-800">
                ¿Qué tipo de problema es? 🤔
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INCIDENT_CATEGORIES.map((category, index) => (
                  <motion.button
                    key={category.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
                      selectedCategory === category.id
                        ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-100/50'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* Fondo de gradiente sutil */}
                    <div 
                      className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        selectedCategory === category.id ? 'opacity-100' : ''
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${category.color}08 0%, ${category.color}03 100%)`
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="p-2.5 rounded-xl text-white shadow-md group-hover:shadow-lg transition-shadow"
                          style={{ backgroundColor: category.color }}
                        >
                          <category.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-gray-800">
                            {category.name}
                          </span>
                          <div className="text-lg leading-none">{category.emoji}</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold mb-3 text-gray-800">
                Título del reporte ✏️
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white shadow-sm focus:shadow-md"
                placeholder="Ej: Bache grande en la calle principal"
                required
                maxLength={100}
              />
              <div className="text-xs text-gray-400 mt-2 text-right">
                {title.length}/100
              </div>
            </motion.div>

            {/* Descripción */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold mb-3 text-gray-800">
                Describe el problema 📝
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none bg-white shadow-sm focus:shadow-md"
                placeholder="Proporciona más detalles que puedan ayudar..."
                maxLength={300}
              />
              <div className="text-xs text-gray-400 mt-2 text-right">
                {description.length}/300
              </div>
            </motion.div>

            {/* Subir imágenes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold mb-3 text-gray-800">
                Fotografías 📸
                <span className="text-gray-400 font-normal ml-1">(opcional, máximo 3)</span>
              </label>
              
              {/* Área de subida */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={images.length >= 3}
                />
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                  images.length >= 3 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                    : 'border-blue-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50 cursor-pointer'
                }`}>
                  <FaImage className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">
                    {images.length >= 3 ? 'Máximo de imágenes alcanzado' : 'Toca para agregar fotos'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Las fotos ayudan a resolver el problema más rápido
                  </p>
                </div>
              </div>

              {/* Preview de imágenes */}
              {images.length > 0 && (
                <div className="flex gap-3 mt-4 flex-wrap">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Botón de envío */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <Button 
                type="submit" 
                disabled={!selectedCategory || !title.trim()}
                className={`w-full font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 ${
                  !selectedCategory || !title.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]'
                }`}
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Reporte 🚀
              </Button>
              
              {(!selectedCategory || !title.trim()) && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Selecciona una categoría y escribe un título para continuar
                </p>
              )}
            </motion.div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
