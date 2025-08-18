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
        {/* Header - Simplificado y más compacto */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-base font-medium text-gray-700 text-center">
            Selecciona el tipo de problema
          </h3>
          <p className="text-xs text-gray-500 text-center mt-1">
            Toca fuera para cancelar
          </p>
        </div>

        {/* Content - Más compacto */}
        <div className="p-3 overflow-y-auto max-h-[40vh]">
          <div className="grid grid-cols-3 gap-2">
            {INCIDENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 hover:shadow-md border-2 ${
                  selectedType === type.id
                    ? 'ring-2 ring-offset-1 shadow-lg border-transparent'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                style={{
                  '--tw-ring-color': selectedType === type.id ? type.color : 'transparent',
                  backgroundColor: selectedType === type.id ? `${type.color}15` : 'white'
                } as React.CSSProperties}
              >
                {/* Icon más grande y visible */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm mb-2"
                  style={{ backgroundColor: type.color }}
                >
                  <span className="text-lg">{type.emoji}</span>
                </div>

                {/* Solo el nombre, sin descripción para ahorrar espacio */}
                <div className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {type.name}
                </div>

                {/* Indicador de selección más pequeño */}
                {selectedType === type.id && (
                  <div className="mt-1">
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: type.color }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
