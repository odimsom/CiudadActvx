import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useIncidents } from '../hooks/useIncidents';
import { useStatistics } from '../hooks/useStatistics';
import type { IncidentReport } from '@ciudad-activa/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Categorías oficiales y sus etiquetas/colores (coherentes con StatisticsPanel)
const CATEGORIES = [
  { key: 'waste',          label: 'Limpieza',        color: '#ef4444' },
  { key: 'infrastructure', label: 'Infraestructura', color: '#f59e42' },
  { key: 'lighting',       label: 'Iluminación',     color: '#fde047' },
  { key: 'transportation', label: 'Transporte',      color: '#2563eb' },
  { key: 'environment',    label: 'Medio ambiente',  color: '#16a34a' },
  { key: 'security',       label: 'Seguridad',       color: '#e11d48' },
  { key: 'water',          label: 'Agua',            color: '#06b6d4' },
  { key: 'noise',          label: 'Ruido',           color: '#a21caf' },
] as const;

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

// Mapeo simple a instituciones responsables por categoría (ilustrativo)
const INSTITUTION_BY_CATEGORY: Record<string, { name: string; color: string }> = {
  waste: { name: 'Ayuntamiento', color: '#0ea5e9' },
  infrastructure: { name: 'Obras Públicas', color: '#f59e0b' },
  lighting: { name: 'EDE/Alumbrado', color: '#22c55e' },
  transportation: { name: 'INTRANT', color: '#2563eb' },
  environment: { name: 'Medio Ambiente', color: '#16a34a' },
  security: { name: 'Policía Municipal', color: '#ef4444' },
  water: { name: 'CAASD', color: '#06b6d4' },
  noise: { name: 'Alcaldía / Policía', color: '#a21caf' },
};

// Semilla determinística para valores "simulados"
const seeded = (n: number) => {
  const m = 233280;
  const a = 9301;
  const c = 49297;
  const seed = (n * a + c) % m;
  return seed / m; // 0..1
};

export const InstitutionDashboardModal: React.FC<Props> = ({ open, onClose }) => {
  const { incidents } = useIncidents();
  const { statistics } = useStatistics();

  // Totales base
  const totalIncidents = statistics?.totalIncidents ?? incidents.length;
  const pending = statistics?.pendingIncidents ?? incidents.length; // en demo local suelen estar todos en pendiente
  const inProgress = statistics?.inProgressIncidents ?? 0;
  const resolved = statistics?.resolvedIncidents ?? 0;

  // KPIs simulados pero estables por sesión (derivados de totalIncidents)
  const kpi = useMemo(() => {
    const s = seeded(totalIncidents || 1);
    const avgHours = Math.round(20 + s * 30); // 20..50h
    const sla = Math.round(70 + s * 25); // 70..95%
    const satisfaction = Math.round(60 + s * 35); // 60..95%
    return { avgHours, sla, satisfaction };
  }, [totalIncidents]);

  // Conteo por categoría y por institución
  const categoryCounts = useMemo(() => {
    return CATEGORIES.map(cat => ({
      key: cat.key,
      name: cat.label,
      value: incidents.filter((i: IncidentReport) => i.type.category === cat.key).length,
      color: cat.color,
    }));
  }, [incidents]);

  const institutionData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};
    for (const inc of incidents) {
      const cat = INSTITUTION_BY_CATEGORY[inc.type.category] ?? { name: 'Ayuntamiento', color: '#94a3b8' };
      if (!map[cat.name]) map[cat.name] = { name: cat.name, value: 0, color: cat.color };
      map[cat.name].value += 1;
    }
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [incidents]);

  const latestIncidents = useMemo(() => {
    const copy = [...incidents];
    copy.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
    return copy.slice(0, 8);
  }, [incidents]);

  if (!open) return null;

  const node = (
    <>
      <div className="fixed inset-0 bg-black/35 z-[1000]" onClick={onClose} aria-hidden />
      <div
        className="fixed inset-y-0 right-0 z-[1100] bg-white w-[92%] md:max-w-2xl border-l border-gray-200 shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-2xl font-bold">Dashboard institucional</h2>
            <p className="text-xs text-gray-500">Datos en tiempo real + indicadores simulados para demo</p>
          </div>
          <button onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-gray-700" aria-label="Cerrar">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg border bg-white">
              <p className="text-xs text-gray-500">Incidentes totales</p>
              <p className="text-2xl font-bold">{totalIncidents}</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <p className="text-xs text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-blue-600">{pending}</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <p className="text-xs text-gray-500">En proceso</p>
              <p className="text-2xl font-bold text-amber-600">{inProgress}</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <p className="text-xs text-gray-500">Resueltas</p>
              <p className="text-2xl font-bold text-green-600">{resolved}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg border bg-white">
              <p className="text-xs text-gray-500">Tiempo promedio de resolución</p>
              <p className="text-2xl font-bold">{resolved > 0 ? `${kpi.avgHours} h` : '—'}</p>
              <p className="text-[10px] text-gray-400 mt-1">Simulado</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <p className="text-xs text-gray-500">Cumplimiento de SLA</p>
              <p className="text-2xl font-bold">{kpi.sla}%</p>
              <p className="text-[10px] text-gray-400 mt-1">Simulado</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <p className="text-xs text-gray-500">Satisfacción ciudadana</p>
              <p className="text-2xl font-bold">{kpi.satisfaction}%</p>
              <p className="text-[10px] text-gray-400 mt-1">Simulado</p>
            </div>
          </div>

          {/* Distribución por estado (si hay stats reales) */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border bg-white">
                <h4 className="font-semibold mb-2">Distribución por estado</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pendiente', value: statistics.pendingIncidents, color: '#2563eb' },
                          { name: 'En proceso', value: statistics.inProgressIncidents, color: '#fbbf24' },
                          { name: 'Resuelto', value: statistics.resolvedIncidents, color: '#22c55e' },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        <Cell fill="#2563eb" />
                        <Cell fill="#fbbf24" />
                        <Cell fill="#22c55e" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-white">
                <h4 className="font-semibold mb-2">Incidentes por institución (estimado)</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={institutionData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} height={50} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {institutionData.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Asignación estimada basada en la categoría del reporte</p>
              </div>
            </div>
          )}

          {/* Por categoría */}
          <div className="p-4 rounded-lg border bg-white">
            <h4 className="font-semibold mb-2">Incidentes por categoría</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryCounts} margin={{ left: 16, right: 16, top: 10, bottom: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {categoryCounts.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Últimos reportes */}
          <div className="p-4 rounded-lg border bg-white">
            <h4 className="font-semibold mb-3">Últimas incidencias</h4>
            {latestIncidents.length === 0 ? (
              <p className="text-sm text-gray-500">No hay reportes para mostrar.</p>
            ) : (
              <div className="divide-y">
                {latestIncidents.map((i) => {
                  const cat = CATEGORIES.find(c => c.key === i.type.category);
                  const inst = INSTITUTION_BY_CATEGORY[i.type.category] ?? { name: 'Ayuntamiento', color: '#94a3b8' };
                  return (
                    <div key={i.id} className="py-3 flex items-start gap-3">
                      <span className="inline-block w-2 h-2 rounded-full mt-2" style={{ background: cat?.color || '#94a3b8' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{i.title || 'Incidencia'}</p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(i.reportedAt).toLocaleDateString()} {new Date(i.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-gray-100">{cat?.label || 'Otro'}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">{PRIORITY_LABEL[i.priority] || 'Media'}</span>
                          <span className="px-2 py-0.5 rounded" style={{ background: `${inst.color}22`, color: inst.color }}>
                            {inst.name}
                          </span>
                        </div>
                        {i.address && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{i.address}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400">
            Nota: Algunos indicadores están simulados para fines de presentación. Cuando el servidor provea estos datos, se mostrarán en vivo.
          </p>
        </div>
      </div>
    </>
  );

  // Portal para evitar que el mapa u otros contenedores corten el modal
  if (typeof document !== 'undefined') {
    return ReactDOM.createPortal(node, document.body);
  }
  return node;
};

export default InstitutionDashboardModal;
