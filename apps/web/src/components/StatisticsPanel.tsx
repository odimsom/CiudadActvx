import React from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useIncidents } from '../hooks/useIncidents';
import { useStatistics } from '../hooks/useStatistics';
import { IncidentReport } from '@ciudad-activa/types';

// --- Categorías oficiales, nombre y color (usa exactamente las mismas claves que llegan desde el backend) ---
const CATEGORIES = [
  { key: 'waste',          label: 'Limpieza',        color: '#ef4444' }, // rojo
  { key: 'infrastructure', label: 'Infraestructura', color: '#f59e42' }, // naranja
  { key: 'lighting',       label: 'Iluminación',     color: '#fde047' }, // amarillo
  { key: 'transportation', label: 'Transporte',      color: '#2563eb' }, // azul
  { key: 'environment',    label: 'Medio ambiente',  color: '#16a34a' }, // verde
  { key: 'security',       label: 'Seguridad',       color: '#e11d48' }, // rojo oscuro
  { key: 'water',          label: 'Agua',            color: '#06b6d4' }, // cyan
  { key: 'noise',          label: 'Ruido',           color: '#a21caf' }, // morado
];

// --- Estado: todos en pendiente para demo ---
const STATUS = [
  { key: 'pending', label: 'Pendiente', color: '#2563eb' },
  // Las otras opciones no se muestran en la demo:
  // { key: 'in_progress', label: 'En proceso', color: '#fbbf24' },
  // { key: 'resolved',    label: 'Resuelto',   color: '#22c55e' },
  // { key: 'rejected',    label: 'Rechazado',  color: '#ef4444' },
];

// --- Prioridades oficiales ---
const PRIORITIES = [
  { key: 'low',    label: 'Baja',    color: '#fde047' },
  { key: 'medium', label: 'Media',   color: '#f59e42' },
  { key: 'high',   label: 'Alta',    color: '#16a34a' },
  { key: 'urgent', label: 'Urgente', color: '#e11d48' },
];

interface StatisticsPanelProps {
  open: boolean;
  onClose: () => void;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ open, onClose }) => {
  const { incidents } = useIncidents();
  const { statistics } = useStatistics();

  // Estadísticas generales del servidor
  const statusCounts = statistics ? [
    { name: 'Pendientes', value: statistics.pendingIncidents, color: '#2563eb' },
    { name: 'En proceso', value: statistics.inProgressIncidents, color: '#fbbf24' },
    { name: 'Resueltas', value: statistics.resolvedIncidents, color: '#22c55e' },
  ] : [
    { name: 'Pendiente', value: incidents.length, color: STATUS[0].color }
  ];

  // -- Por prioridad (usar datos locales si no hay del servidor)
  const priorityCounts = PRIORITIES.map(p => ({
    name: p.label,
    value: incidents.filter((i: IncidentReport) => i.priority === p.key).length,
    color: p.color
  }));

  // -- Por categoría (con orden y colores exactos)
  const categoryCounts = CATEGORIES.map(cat => ({
    name: cat.label,
    value: incidents.filter((i: IncidentReport) => i.type.category === cat.key).length,
    color: cat.color
  }));

  // Panel oculto si no está abierto
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed top-0 right-0 h-screen w-full max-w-md bg-white shadow-xl z-50 border-l border-gray-200 overflow-y-auto flex flex-col"
        style={{ minWidth: 350 }}
        aria-modal="true"
        role="dialog"
        onPointerDown={e => e.stopPropagation()} // ← Evita conflictos con mover barra
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Estadísticas</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-400 hover:text-gray-700"
            aria-label="Cerrar panel"
          >
            ×
          </button>
        </div>
        <div className="flex-1 flex flex-col p-6">
          <h3 className="text-xl font-semibold mb-2">Reportes en tu ciudad</h3>
          <p className="text-gray-500 mb-6 text-sm">Visualiza el estado de las incidencias reportadas.</p>

          {/* Por estado */}
          <section className="mb-8">
            <h4 className="text-lg font-semibold mb-3">Por estado</h4>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={statusCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill={STATUS[0].color} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-3 mt-2 justify-center text-sm flex-wrap">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: STATUS[0].color }}></span>
                {STATUS[0].label} ({incidents.length})
              </span>
            </div>
          </section>

          {/* Por prioridad */}
          <section className="mb-8">
            <h4 className="text-lg font-semibold mb-3">Por prioridad</h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={priorityCounts}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {priorityCounts.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Por categoría (gráfico de barras horizontal, colores y nombres exactos) */}
          <section className="mb-8">
            <h4 className="text-lg font-semibold mb-3">Por categoría</h4>
            <ResponsiveContainer width="100%" height={CATEGORIES.length * 40}>
              <BarChart
                data={categoryCounts}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 0, bottom: 0 }}
              >
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 16 }}
                />
                <Tooltip
                  formatter={(value: number) => `${value} reporte${value === 1 ? '' : 's'}`}
                  labelFormatter={label => label}
                />
                <Bar dataKey="value">
                  {categoryCounts.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-2 flex-wrap justify-center text-xs mt-2">
              {categoryCounts.map((cat) => (
                <span key={cat.name} className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: cat.color }}></span>
                  {cat.name}
                </span>
              ))}
            </div>
          </section>

          <div className="mt-auto border-t pt-6 text-xs text-gray-400">
            Ciudad Activa &copy; 2025 &mdash; Datos en tiempo real
          </div>
        </div>
      </aside>
    </>
  );
};
