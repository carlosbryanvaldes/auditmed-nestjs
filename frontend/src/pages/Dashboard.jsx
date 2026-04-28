import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auditsAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

function KpiCard({ label, value, sub, color = 'blue', icon }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-100',
    green:  'bg-green-50 text-green-700 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    red:    'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <div className={`card border ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
          <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

const STATUS_LABELS = {
  DRAFT:          { label: 'Borrador',     color: 'gray' },
  IN_PROGRESS:    { label: 'En proceso',   color: 'blue' },
  PENDING_REVIEW: { label: 'Pend. revisión', color: 'yellow' },
  CLOSED:         { label: 'Cerrado',      color: 'green' },
  REJECTED:       { label: 'Rechazado',    color: 'red' },
};

export default function Dashboard() {
  const { user, can } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: async () => (await auditsAPI.stats()).data,
    enabled: can('audits:read'),
    staleTime: 60_000,
  });

  const closed = stats?.byStatus?.find((s) => s.status === 'CLOSED')?.count ?? 0;
  const inProg = stats?.byStatus?.find((s) => s.status === 'IN_PROGRESS')?.count ?? 0;
  const draft  = stats?.byStatus?.find((s) => s.status === 'DRAFT')?.count ?? 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Hola, {user?.fullName?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      {can('audits:read') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total auditorías"   value={isLoading ? '…' : stats?.total}          icon="📋" color="blue" />
          <KpiCard label="Cerradas"           value={isLoading ? '…' : closed}                icon="✅" color="green" />
          <KpiCard label="En proceso"         value={isLoading ? '…' : inProg}                icon="🔄" color="yellow" />
          <KpiCard
            label="Cumplimiento prom."
            value={isLoading ? '…' : stats?.avgCompliance != null ? `${stats.avgCompliance}%` : '—'}
            icon="📈"
            color={stats?.avgCompliance >= 80 ? 'green' : stats?.avgCompliance >= 60 ? 'yellow' : 'red'}
          />
        </div>
      )}

      {/* Status breakdown */}
      {can('audits:read') && stats?.byStatus?.length > 0 && (
        <div className="card">
          <h3 className="section-title">Estado de auditorías</h3>
          <div className="space-y-2">
            {stats.byStatus.map((s) => {
              const meta = STATUS_LABELS[s.status] || { label: s.status, color: 'gray' };
              const pct  = stats.total ? Math.round((s.count / stats.total) * 100) : 0;
              return (
                <div key={s.status} className="flex items-center gap-3">
                  <span className={`badge badge-${meta.color} w-32 text-center`}>{meta.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {s.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="card">
        <h3 className="section-title">Acciones rápidas</h3>
        <div className="flex flex-wrap gap-3">
          {can('audits:write') && (
            <button className="btn btn-primary" onClick={() => navigate('/audits/new')}>
              + Nueva auditoría
            </button>
          )}
          {can('audits:read') && (
            <button className="btn btn-ghost" onClick={() => navigate('/audits')}>
              Ver todas las auditorías
            </button>
          )}
          {can('forms:write') && (
            <button className="btn btn-ghost" onClick={() => navigate('/forms/new')}>
              + Nuevo formulario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
