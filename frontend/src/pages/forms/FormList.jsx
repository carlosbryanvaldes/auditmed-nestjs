import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formsAPI } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export default function FormList() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const { can }  = useAuth();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['forms-list'],
    queryFn: async () => (await formsAPI.list()).data,
    staleTime: 60_000,
  });

  const publishMutation = useMutation({
    mutationFn: (id) => formsAPI.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms-list'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => formsAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms-list'] }),
  });

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Formularios</h2>
          <p className="text-sm text-gray-500">{templates.length} plantillas</p>
        </div>
        {can('forms:write') && (
          <button className="btn btn-primary" onClick={() => navigate('/forms/new')}>
            + Nuevo formulario
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spin w-6 h-6 border-4 border-gray-200 border-t-brand-500 rounded-full" />
        </div>
      ) : templates.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm text-gray-500">Sin formularios. Crea el primero.</p>
          {can('forms:write') && (
            <button className="btn btn-primary btn-sm mt-3" onClick={() => navigate('/forms/new')}>
              + Crear formulario
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="card hover:border-brand-200 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  {t.description && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{t.description}</div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge badge-blue">v{t.version}</span>
                    <span className={`badge ${t.status === 'PUBLISHED' ? 'badge-green' : 'badge-gray'}`}>
                      {t.status === 'PUBLISHED' ? '✓ Publicado' : '⏳ Borrador'}
                    </span>
                    {t.formType && <span className="badge badge-gray">{t.formType}</span>}
                    <span className="badge badge-gray">
                      {t.sectionsCount ?? 0} secc · {t.fieldsCount ?? 0} campos
                    </span>
                  </div>
                </div>
                {can('forms:write') && (
                  <div className="flex items-center gap-1 shrink-0">
                    {t.status !== 'PUBLISHED' && (
                      <button
                        className="btn btn-ghost btn-sm text-green-600 hover:bg-green-50"
                        disabled={publishMutation.isPending}
                        onClick={() => publishMutation.mutate(t.id)}
                      >
                        🚀 Publicar
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/forms/${t.id}`)}>
                      ✏️ Editar
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-red-400 hover:bg-red-50"
                      disabled={removeMutation.isPending}
                      onClick={() => {
                        if (confirm(`¿Eliminar "${t.name}"?`)) removeMutation.mutate(t.id);
                      }}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
