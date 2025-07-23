import React, { useState } from 'react';

interface EmergencyPanelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmergencyReport) => void;
}

interface EmergencyReport {
  type: 'flood' | 'earthquake';
  province: string;
  description?: string;
  imageUrl?: string;
  reportedAt: string;
}

const PROVINCIAS = [
  'Santo Domingo', 'Distrito Nacional', 'Santiago', 'La Vega', 'Puerto Plata',
  'San Cristóbal', 'La Romana', 'San Pedro de Macorís', 'Azua', 'Duarte',
  'San Juan', 'Monte Plata', 'Peravia', 'Barahona', 'Espaillat',
];

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({ open, onClose, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<'flood' | 'earthquake' | null>(null);
  const [province, setProvince] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = () => {
    const payload: EmergencyReport = {
      type: type!,
      province,
      description,
      imageUrl: image ? URL.createObjectURL(image) : undefined,
      reportedAt: new Date().toISOString(),
    };
    onSubmit(payload);
    setStep(4); // Gracias
    setTimeout(onClose, 3000); // Cierra luego de 3s
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">¿Deseas reportar un estado de emergencia?</h2>
            <div className="flex gap-4">
              <button className="btn bg-gray-100" onClick={onClose}>Cancelar</button>
              <button className="btn bg-blue-600 text-white" onClick={() => setStep(1)}>Sí, reportar</button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">¿Qué tipo de emergencia?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setType('flood'); setStep(2); }} className={`p-4 border rounded-lg ${type === 'flood' ? 'bg-blue-100' : ''}`}>🌊 Inundación</button>
              <button onClick={() => { setType('earthquake'); setStep(2); }} className={`p-4 border rounded-lg ${type === 'earthquake' ? 'bg-blue-100' : ''}`}>🌎 Sismo</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">¿En qué provincia ocurrió?</h2>
            <select
              className="w-full border p-2 rounded"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              <option value="">Selecciona una provincia</option>
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-blue-600">Atrás</button>
              <button onClick={() => setStep(3)} className="btn bg-blue-600 text-white">Continuar</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Detalles adicionales</h2>
            <textarea
              placeholder="Descripción (opcional)"
              className="w-full border p-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="text-sm text-blue-600">Atrás</button>
              <button onClick={handleSubmit} className="btn bg-green-600 text-white">Reportar emergencia</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 text-center py-20">
            <h2 className="text-2xl font-bold text-green-600">✅ ¡Gracias por tu reporte!</h2>
            <p className="text-gray-600">Tu ayuda es vital para actuar rápido ante emergencias.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <aside className="fixed top-0 right-0 h-screen w-full max-w-md bg-white shadow-xl z-50 border-l border-gray-200 overflow-y-auto flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Estado de emergencia</h2>
        <button onClick={onClose} className="text-gray-500 text-xl">×</button>
      </div>
      {renderStep()}
    </aside>
  );
};
