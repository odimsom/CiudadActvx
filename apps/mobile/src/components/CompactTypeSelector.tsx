import React from 'react';

interface IncidentType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

interface CompactTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (typeId: string) => void;
  selectedType?: string;
}

const INCIDENT_TYPES: IncidentType[] = [
  { id: 'waste', name: 'Basura', emoji: '🗑️', color: '#ef4444', description: 'Acumulación de desechos' },
  { id: 'pothole', name: 'Bache', emoji: '🕳️', color: '#f59e0b', description: 'Daños en la vía' },
  { id: 'lighting', name: 'Iluminación', emoji: '💡', color: '#fbbf24', description: 'Alumbrado público' },
  { id: 'water', name: 'Agua', emoji: '💧', color: '#3b82f6', description: 'Fugas o problemas de agua' },
  { id: 'trees', name: 'Árboles', emoji: '🌳', color: '#16a34a', description: 'Poda o árboles caídos' },
  { id: 'traffic', name: 'Tráfico', emoji: '🚦', color: '#dc2626', description: 'Semáforos y señalización' },
  { id: 'noise', name: 'Ruido', emoji: '🔊', color: '#9333ea', description: 'Contaminación sonora' },
  { id: 'safety', name: 'Seguridad', emoji: '🚨', color: '#c2410c', description: 'Situaciones de riesgo' },
  { id: 'other', name: 'Otro', emoji: '❓', color: '#6b7280', description: 'Otros problemas urbanos' },
];

export const CompactTypeSelector: React.FC<CompactTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedType
}) => {
  if (!isOpen) return null;

  const handleSelect = (typeId: string) => {
    onSelect(typeId);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-[9998] flex items-end backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full bg-white rounded-t-2xl shadow-2xl max-h-[45vh] overflow-hidden animate-slideUp">
        {/* Header - Simplificado sin botones duplicados */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-base font-semibold text-gray-800 text-center">
            Selecciona el tipo de problema
          </h3>
          <p className="text-xs text-gray-500 text-center mt-1">
            Toca fuera para cancelar
          </p>
        </div>

        {/* Content - Mejorado con mejor UX */}
        <div className="p-4 overflow-y-auto max-h-[40vh]">
          <div className="grid grid-cols-3 gap-3">
            {INCIDENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 hover:shadow-lg border-2 group ${
                  selectedType === type.id
                    ? 'ring-2 ring-offset-2 shadow-xl border-transparent scale-105'
                    : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  '--tw-ring-color': selectedType === type.id ? type.color : 'transparent',
                  backgroundColor: selectedType === type.id ? `${type.color}20` : 'white',
                  transform: selectedType === type.id ? 'scale(1.05)' : 'scale(1)'
                } as React.CSSProperties}
              >
                {/* Icon más atractivo */}
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3 transition-all duration-300 group-hover:scale-110 ${
                    selectedType === type.id ? 'shadow-xl' : ''
                  }`}
                  style={{ backgroundColor: type.color }}
                >
                  <span className="text-2xl">{type.emoji}</span>
                </div>

                {/* Texto mejorado */}
                <div className="text-xs font-semibold text-gray-800 text-center leading-tight mb-1">
                  {type.name}
                </div>
                
                <div className="text-xs text-gray-500 text-center leading-tight">
                  {type.description}
                </div>

                {/* Indicador de selección */}
                {selectedType === type.id && (
                  <div className="mt-2 animate-bounce">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: type.color }}
                    >
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Mensaje de ayuda */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-800 text-center">
              💡 <strong>Consejo:</strong> Selecciona el tipo que mejor describa tu problema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
