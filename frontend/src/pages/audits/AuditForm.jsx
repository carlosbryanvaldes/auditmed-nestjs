import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditsAPI, formsAPI, masterAPI, usersAPI } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

const CONFORMITY = [
  { value: 'conforme',    label: 'Conforme',    cls: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'no_conforme', label: 'No conforme', cls: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'no_aplica',   label: 'N/A',         cls: 'bg-gray-100 text-gray-600 border-gray-300' },
];

function ResponseItem({ field, response, onChange }) {
  const current = response?.conformityResult ?? '';
  const obs     = response?.observation ?? '';

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-400 font-mono w-5 mt-0.5">{field.sortOrder + 1}.</span>
        <p className="text-sm text-gray-800 flex-1">{field.label}</p>
        {field.score > 0 && (
          <span className="badge badge-blue text-[10px] shrink-0">{field.score}pt</span>
        )}
      </div>

      {/* Conformity buttons */}
      {['YES_NO', 'YES_NO_NA'].includes(field.fieldType) && (
        <div className="flex gap-2 ml-7">
          {CONFORMITY.filter((c) =>
            field.fieldType === 'YES_NO' ? c.value !== 'no_aplica' : true,
          ).map((c) => (
            <button
              key={c.value}
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                current === c.value ? c.cls : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => onChange({ conformityResult: c.value, observation: obs })}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {field.fieldType === 'TEXT' && (
        <textarea
          className="input resize-none ml-7 text-xs"
          rows={2}
          value={response?.value ?? ''}
          placeholder="Respuesta libre…"
          onChange={(e) => onChange({ value: e.target.value, observation: obs })}
        />
      )}

      {field.fieldType === 'SCALE' && (
        <div className="flex gap-2 ml-7">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`w-8 h-8 rounded-full text-sm font-bold border transition ${
                response?.value === String(n)
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand-400'
              }`}
              onClick={() => onChange({ value: String(n), observation: obs })}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {['SINGLE_SELECT', 'MULTI_SELECT'].includes(field.fieldType) && (
        <select
          className="select ml-7 text-xs"
          value={response?.value ?? ''}
          onChange={(e) => onChange({ value: e.target.value, observation: obs })}
        >
          <option value="">— Seleccionar —</option>
          {field.options?.map((opt) => (
            <option key={opt.id} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {/* Observation */}
      {(field.hasObservation || current === 'no_conforme') && (
        <textarea
          className="input resize-none ml-7 text-xs"
          rows={2}
          value={obs}
          placeholder="Observación…"
          onChange={(e) =>
            onChange({ conformityResult: current, value: response?.value, observation: e.target.value })
          }
        />
      )}
    </div>
  );
}

export default function AuditForm() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const qc          = useQueryClient();
  const { user }    = useAuth();
  const isEdit      = Boolean(id);

  const [meta, setMeta] = useState({
    auditDate: new Date().toISOString().slice(0, 10),
    formTemplateId: '',
    auditorId: user?.id ?? '',
    unidadEjecutoraId: '',
    historiaClinicaNum: '',
    diagnosisCie10: '',
    diagnosisDescription: '',
    generalObservations: '',
  });
  const [responses, setResponses] = useState({});  // { fieldId: { conformityResult, value, observation } }
  const [activeSection, setActiveSection] = useState(0);

  // Load dropdowns
  const { data: templates = [] } = useQuery({ queryKey: ['forms-list'], queryFn: async () => (await formsAPI.list()).data });
  const { data: unidades  = [] } = useQuery({ queryKey: ['unidades'],   queryFn: async () => (await masterAPI.listUnidades()).data });
  const { data: users     = [] } = useQuery({ queryKey: ['users-list'], queryFn: async () => (await usersAPI.list()).data });

  // Load selected template
  const { data: template } = useQuery({
    queryKey: ['form-template', meta.formTemplateId],
    queryFn: async () => (await formsAPI.get(Number(meta.formTemplateId))).data,
    enabled: Boolean(meta.formTemplateId),
  });

  // Load existing audit
  const { data: existing } = useQuery({
    queryKey: ['audit', id],
    queryFn: async () => (await auditsAPI.get(Number(id))).data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setMeta({
        auditDate: existing.auditDate,
        formTemplateId: String(existing.formTemplateId),
        auditorId: existing.auditorId,
        unidadEjecutoraId: existing.unidadEjecutoraId ?? '',
        historiaClinicaNum: existing.historiaClinicaNum ?? '',
        diagnosisCie10: existing.diagnosisCie10 ?? '',
        diagnosisDescription: existing.diagnosisDescription ?? '',
        generalObservations: existing.generalObservations ?? '',
      });
      const map = {};
      existing.responses?.forEach((r) => {
        map[r.fieldId] = { conformityResult: r.conformityResult, value: r.value, observation: r.observation };
      });
      setResponses(map);
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async (close = false) => {
      const allFields = template?.sections?.flatMap((s) => s.fields) ?? [];
      const resp = allFields
        .filter((f) => responses[f.id])
        .map((f) => ({ fieldId: f.id, ...responses[f.id] }));

      const payload = {
        ...meta,
        formTemplateId: Number(meta.formTemplateId),
        auditorId: Number(meta.auditorId),
        unidadEjecutoraId: meta.unidadEjecutoraId ? Number(meta.unidadEjecutoraId) : undefined,
        responses: resp,
      };

      if (close) {
        return (await auditsAPI.close(Number(id), payload)).data;
      } else if (isEdit) {
        return (await auditsAPI.update(Number(id), payload)).data;
      } else {
        return (await auditsAPI.create(payload)).data;
      }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['audits'] });
      qc.invalidateQueries({ queryKey: ['audit-stats'] });
      navigate('/audits');
    },
  });

  const isClosed = existing?.status === 'CLOSED';

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button className="text-xs text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1" onClick={() => navigate('/audits')}>
            ← Volver
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? `Auditoría ${existing?.caseNumber ?? ''}` : 'Nueva auditoría'}
          </h2>
        </div>
        {!isClosed && (
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(false)}>
              💾 Guardar
            </button>
            {isEdit && (
              <button className="btn btn-primary btn-sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(true)}>
                ✅ Cerrar auditoría
              </button>
            )}
          </div>
        )}
      </div>

      {saveMutation.isError && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {saveMutation.error?.response?.data?.message ?? 'Error al guardar'}
        </div>
      )}

      {isClosed && (
        <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✅ Auditoría cerrada — Cumplimiento: <strong>{existing.compliancePercentage}%</strong> — Calificación: <strong>{existing.globalRating}</strong>
        </div>
      )}

      {/* Metadata */}
      <div className="card space-y-4">
        <h3 className="section-title">Datos generales</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha de auditoría *</label>
            <input type="date" className="input" value={meta.auditDate}
              onChange={(e) => setMeta((m) => ({ ...m, auditDate: e.target.value }))} disabled={isClosed} />
          </div>
          <div>
            <label className="label">Formulario *</label>
            <select className="select" value={meta.formTemplateId}
              onChange={(e) => setMeta((m) => ({ ...m, formTemplateId: e.target.value }))} disabled={isClosed || isEdit}>
              <option value="">— Seleccionar —</option>
              {templates.filter((t) => t.status === 'PUBLISHED').map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Auditor *</label>
            <select className="select" value={meta.auditorId}
              onChange={(e) => setMeta((m) => ({ ...m, auditorId: e.target.value }))} disabled={isClosed}>
              <option value="">— Seleccionar —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Unidad ejecutora</label>
            <select className="select" value={meta.unidadEjecutoraId}
              onChange={(e) => setMeta((m) => ({ ...m, unidadEjecutoraId: e.target.value }))} disabled={isClosed}>
              <option value="">— Seleccionar —</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">N° Historia Clínica</label>
            <input className="input" value={meta.historiaClinicaNum}
              onChange={(e) => setMeta((m) => ({ ...m, historiaClinicaNum: e.target.value }))} disabled={isClosed} />
          </div>
          <div>
            <label className="label">CIE-10</label>
            <input className="input" value={meta.diagnosisCie10} placeholder="Ej: J18.9"
              onChange={(e) => setMeta((m) => ({ ...m, diagnosisCie10: e.target.value }))} disabled={isClosed} />
          </div>
          <div className="col-span-2">
            <label className="label">Descripción diagnóstico</label>
            <input className="input" value={meta.diagnosisDescription}
              onChange={(e) => setMeta((m) => ({ ...m, diagnosisDescription: e.target.value }))} disabled={isClosed} />
          </div>
        </div>
      </div>

      {/* Form sections + fields */}
      {template?.sections?.length > 0 && (
        <div className="card space-y-4">
          <h3 className="section-title">Checklist de auditoría</h3>
          {/* Section tabs */}
          <div className="flex gap-2 flex-wrap">
            {template.sections.map((sec, i) => (
              <button
                key={sec.id}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                  activeSection === i
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => setActiveSection(i)}
              >
                {sec.title}
              </button>
            ))}
          </div>

          {template.sections[activeSection] && (
            <div className="space-y-2">
              {template.sections[activeSection].description && (
                <p className="text-xs text-gray-500 italic">
                  {template.sections[activeSection].description}
                </p>
              )}
              {template.sections[activeSection].fields.map((field) => (
                <ResponseItem
                  key={field.id}
                  field={field}
                  response={responses[field.id]}
                  onChange={(val) =>
                    setResponses((r) => ({ ...r, [field.id]: val }))
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* General observations */}
      <div className="card space-y-3">
        <h3 className="section-title">Observaciones generales</h3>
        <textarea
          className="input resize-none"
          rows={3}
          value={meta.generalObservations}
          onChange={(e) => setMeta((m) => ({ ...m, generalObservations: e.target.value }))}
          disabled={isClosed}
          placeholder="Observaciones finales del auditor…"
        />
      </div>

      {/* Sticky action bar */}
      {!isClosed && (
        <div className="sticky bottom-4 flex justify-end">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-3">
            <button className="btn btn-ghost btn-sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(false)}>
              {saveMutation.isPending ? '…' : '💾 Guardar borrador'}
            </button>
            {isEdit && (
              <button className="btn btn-primary btn-sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(true)}>
                ✅ Cerrar auditoría
              </button>
            )}
            {!isEdit && (
              <button className="btn btn-primary btn-sm" disabled={saveMutation.isPending || !meta.formTemplateId} onClick={() => saveMutation.mutate(false)}>
                Crear caso →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
