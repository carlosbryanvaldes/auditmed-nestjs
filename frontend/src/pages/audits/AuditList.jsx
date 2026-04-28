import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auditsAPI } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

const STATUS_META = {
  DRAFT:          { label: 'Borrador',        cls: 'badge-gray'   },
  IN_PROGRESS:    { label: 'En proceso',       cls: 'badge-blue'   },
  PENDING_REVIEW: { label: 'Pend. revisión',   cls: 'badge-yellow' },
  CLOSED:         { label: 'Cerrado',          cls: 'badge-green'  },
  REJECTED:       { label: 'Rechazado',        cls: 'badge-red'    },
};

function ComplianceBar({ pct }) {
  if (pct == null) return <span className="text-gray-400 text-xs">—</span>;
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-xs text-gray-500">{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function AuditList() {
  const navigate = useNavigate();
  const { can }  = useAuth();

  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audits', page, status],
    queryFn: async () => (await auditsAPI.list({ page, limit: 20, ...(status && { status }) })).data,
    placeholderData: (p) => p,
    staleTime: 30_000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Auditorías</h2>
          <p className="text-sm text-gray-500">{total} casos en total</p>
        </div>
        {can('audits:write') && (
          <button className="btn btn-primary" onClick={() => navigate('/audits/new')}>
            + Nueva auditoría
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          className="select w-44"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        {status && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setStatus(''); setPage(1); }}>
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th rounded-tl-xl">N° Caso</th>
              <th className="table-th">Fecha</th>
              <th className="table-th">Formulario</th>
              <th className="table-th">Auditor</th>
              <th className="table-th">Estado</th>
              <th className="table-th rounded-tr-xl">Cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex justify-center">
                    <div className="spin w-6 h-6 border-4 border-gray-200 border-t-brand-500 rounded-full" />
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm text-gray-500">No se encontraron auditorías.</p>
                  {can('audits:write') && (
                    <button className="btn btn-primary btn-sm mt-3" onClick={() => navigate('/audits/new')}>
                      + Crear primera auditoría
                    </button>
                  )}
                </td>
              </tr>
            )}
            {items.map((a) => {
              const meta = STATUS_META[a.status] ?? { label: a.status, cls: 'badge-gray' };
              return (
                <tr
                  key={a.id}
                  className="hover:bg-blue-50/40 cursor-pointer transition"
                  onClick={() => navigate(`/audits/${a.id}`)}
                >
                  <td className="table-td font-mono text-xs font-semibold text-brand-600">
                    {a.caseNumber}
                  </td>
                  <td className="table-td text-xs text-gray-500">{a.auditDate}</td>
                  <td className="table-td text-sm">{a.formTemplate?.name ?? '—'}</td>
                  <td className="table-td text-sm">{a.auditor?.fullName ?? '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${meta.cls}`}>{meta.label}</span>
                  </td>
                  <td className="table-td">
                    <ComplianceBar pct={a.compliancePercentage} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Anterior
              </button>
              <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
