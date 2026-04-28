/**
 * FormBuilder — constructor visual de formularios de auditoría.
 * Rutas: /forms/new  y  /forms/:id
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsAPI } from '../../api/client';

// ── Constants ─────────────────────────────────────────────────────────────────

const FIELD_TYPES = [
  { value: 'YES_NO_NA',     label: 'Sí / No / N/A' },
  { value: 'YES_NO',        label: 'Sí / No' },
  { value: 'TEXT',          label: 'Texto libre' },
  { value: 'SCALE',         label: 'Escala 1–5' },
  { value: 'NUMBER',        label: 'Número' },
  { value: 'DATE',          label: 'Fecha' },
  { value: 'SINGLE_SELECT', label: 'Selección única' },
  { value: 'MULTI_SELECT',  label: 'Selección múltiple' },
  { value: 'SIGNATURE',     label: 'Firma digital' },
  { value: 'FILE',          label: 'Archivo adjunto' },
];

const FORM_TYPES = [
  '', 'historia_clinica', 'urgencias', 'cirugia', 'consulta_externa',
  'hospitalizacion', 'laboratorio', 'farmacia',
];

const needsOptions = (t) => t === 'SINGLE_SELECT' || t === 'MULTI_SELECT';

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
}

const uid  = () => Math.random().toString(36).slice(2);
const newOpt   = () => ({ _id: uid(), label: '', value: '' });
const newField = (i = 0) => ({
  _id: uid(), label: '', fieldKey: '', fieldType: 'YES_NO_NA',
  required: true, hasObservation: false, score: 1.0, sortOrder: i, options: [],
});
const newSection = (i = 0) => ({
  _id: uid(), title: '', description: '', orderIndex: i, weight: 1.0, fields: [],
});
const emptyTmpl = () => ({
  name: '', description: '', version: '1.0', formType: '',
  status: 'DRAFT', isActive: true, sections: [],
});

function deserialize(data) {
  return {
    name:        data.name ?? '',
    description: data.description ?? '',
    version:     data.version ?? '1.0',
    formType:    data.formType ?? '',
    status:      data.status ?? 'DRAFT',
    isActive:    data.isActive ?? true,
    sections: (data.sections ?? []).map((s) => ({
      ...s, _id: uid(),
      fields: (s.fields ?? []).map((f) => ({
        ...f, _id: uid(),
        options: (f.options ?? []).map((o) => ({ ...o, _id: uid() })),
      })),
    })),
  };
}

function serialize(tmpl) {
  return {
    name:        tmpl.name,
    description: tmpl.description || undefined,
    version:     tmpl.version,
    formType:    tmpl.formType || undefined,
    status:      tmpl.status,
    isActive:    tmpl.isActive,
    sections: tmpl.sections.map((s, si) => ({
      title:       s.title,
      description: s.description || undefined,
      orderIndex:  si,
      weight:      s.weight,
      fields: s.fields.map((f, fi) => ({
        label:          f.label,
        fieldKey:       f.fieldKey || slugify(f.label),
        fieldType:      f.fieldType,
        required:       f.required,
        hasObservation: f.hasObservation,
        score:          f.score,
        sortOrder:      fi,
        options: needsOptions(f.fieldType)
          ? f.options.map((o, oi) => ({ label: o.label, value: o.value || slugify(o.label), sortOrder: oi }))
          : [],
      })),
    })),
  };
}

function validate(tmpl) {
  const e = [];
  if (!tmpl.name.trim()) e.push('El formulario debe tener un nombre.');
  tmpl.sections.forEach((s, si) => {
    if (!s.title.trim()) e.push(`Sección ${si + 1}: falta el título.`);
    s.fields.forEach((f, fi) => {
      if (!f.label.trim()) e.push(`Sección ${si + 1}, Campo ${fi + 1}: falta la etiqueta.`);
      if (!f.fieldKey.trim() && !f.label.trim()) e.push(`Sección ${si + 1}, Campo ${fi + 1}: falta la clave.`);
      if (needsOptions(f.fieldType) && f.options.length === 0)
        e.push(`Sección ${si + 1}, Campo ${fi + 1}: tipo selector necesita opciones.`);
    });
  });
  return e;
}

// ── FieldCard ─────────────────────────────────────────────────────────────────

function FieldCard({ field, index, total, onChange, onDelete, onUp, onDown }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <span className="text-xs text-gray-400 w-5 text-center">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-800 truncate block">
            {field.label || <span className="italic text-gray-400">Sin nombre</span>}
          </span>
          <span className="text-[10px] text-gray-400">
            {FIELD_TYPES.find((t) => t.value === field.fieldType)?.label} {field.required && '· Req'}
          </span>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="btn-icon disabled:opacity-30" disabled={index === 0} onClick={onUp}>↑</button>
          <button className="btn-icon disabled:opacity-30" disabled={index === total - 1} onClick={onDown}>↓</button>
          <button className="btn-icon text-red-400 hover:bg-red-50" onClick={onDelete}>🗑</button>
        </div>
        <span className="text-gray-300 text-xs">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Etiqueta *</label>
              <input
                className="input"
                value={field.label}
                onChange={(e) => onChange({ ...field, label: e.target.value })}
                onBlur={() => { if (!field.fieldKey && field.label) onChange({ ...field, fieldKey: slugify(field.label) }); }}
                placeholder="¿Historia clínica completa?"
              />
            </div>
            <div>
              <label className="label">Clave *</label>
              <input
                className="input font-mono text-xs"
                value={field.fieldKey}
                onChange={(e) => onChange({ ...field, fieldKey: slugify(e.target.value) })}
                placeholder="historia_clinica_completa"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Tipo</label>
              <select
                className="select"
                value={field.fieldType}
                onChange={(e) => onChange({ ...field, fieldType: e.target.value, options: [] })}
              >
                {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Puntaje</label>
              <input type="number" className="input" step="0.5" min="0"
                value={field.score} onChange={(e) => onChange({ ...field, score: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="flex flex-col gap-2 pt-5">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={field.required} onChange={(e) => onChange({ ...field, required: e.target.checked })} />
                Requerido
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={field.hasObservation} onChange={(e) => onChange({ ...field, hasObservation: e.target.checked })} />
                Observación
              </label>
            </div>
          </div>

          {needsOptions(field.fieldType) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="label mb-0">Opciones</label>
                <button type="button" className="btn btn-ghost btn-sm text-xs"
                  onClick={() => onChange({ ...field, options: [...field.options, newOpt()] })}>
                  + Agregar opción
                </button>
              </div>
              {field.options.map((opt, oi) => (
                <div key={opt._id} className="flex gap-2 items-center group">
                  <input className="input flex-1 text-xs py-1" placeholder="Etiqueta" value={opt.label}
                    onChange={(e) => {
                      const opts = [...field.options]; opts[oi] = { ...opt, label: e.target.value };
                      onChange({ ...field, options: opts });
                    }} />
                  <input className="input w-28 font-mono text-xs py-1" placeholder="valor" value={opt.value}
                    onChange={(e) => {
                      const opts = [...field.options]; opts[oi] = { ...opt, value: e.target.value };
                      onChange({ ...field, options: opts });
                    }} />
                  <button className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    onClick={() => onChange({ ...field, options: field.options.filter((_, i) => i !== oi) })}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────

function SectionCard({ section, si, total, onChange, onDelete, onUp, onDown }) {
  const [collapsed, setCollapsed] = useState(false);

  const addField  = () => onChange({ ...section, fields: [...section.fields, newField(section.fields.length)] });
  const updField  = (i, f) => { const fs = [...section.fields]; fs[i] = f; onChange({ ...section, fields: fs }); };
  const delField  = (i)    => onChange({ ...section, fields: section.fields.filter((_, x) => x !== i) });
  const moveField = (i, d) => {
    const fs = [...section.fields]; const j = i + d;
    if (j < 0 || j >= fs.length) return;
    [fs[i], fs[j]] = [fs[j], fs[i]]; onChange({ ...section, fields: fs });
  };

  return (
    <div className="border-2 border-blue-100 rounded-2xl bg-blue-50/20">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 cursor-pointer" onClick={() => setCollapsed((v) => !v)}>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Sección {si + 1}</span>
          <span className="ml-2 text-sm font-semibold text-gray-800">
            {section.title || <span className="italic text-gray-400">Sin título</span>}
          </span>
          <span className="ml-2 badge badge-gray text-[10px]">{section.fields.length} campos</span>
        </div>
        <div className="flex gap-1">
          <button className="btn-icon disabled:opacity-30" disabled={si === 0} onClick={onUp}>↑</button>
          <button className="btn-icon disabled:opacity-30" disabled={si === total - 1} onClick={onDown}>↓</button>
          <button className="btn-icon text-red-400 hover:bg-red-50" onClick={onDelete}>🗑</button>
          <button className="btn-icon" onClick={() => setCollapsed((v) => !v)}>{collapsed ? '▼' : '▲'}</button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">Título *</label>
              <input className="input" value={section.title}
                onChange={(e) => onChange({ ...section, title: e.target.value })} placeholder="Ej: Historia Clínica" />
            </div>
            <div>
              <label className="label">Peso</label>
              <input type="number" className="input" step="0.1" min="0" value={section.weight}
                onChange={(e) => onChange({ ...section, weight: parseFloat(e.target.value) || 1 })} />
            </div>
            <div className="col-span-3">
              <label className="label">Descripción</label>
              <input className="input" value={section.description}
                onChange={(e) => onChange({ ...section, description: e.target.value })} placeholder="Instrucciones…" />
            </div>
          </div>

          <div className="space-y-2">
            {section.fields.length === 0 && (
              <div className="text-center py-5 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                Sin campos. Agrega el primero.
              </div>
            )}
            {section.fields.map((f, fi) => (
              <FieldCard key={f._id} field={f} index={fi} total={section.fields.length}
                onChange={(upd) => updField(fi, upd)}
                onDelete={() => delField(fi)}
                onUp={() => moveField(fi, -1)}
                onDown={() => moveField(fi, 1)} />
            ))}
          </div>
          <button type="button"
            className="btn btn-ghost btn-sm w-full border border-dashed border-blue-200 text-blue-500 hover:bg-blue-50"
            onClick={addField}>
            + Agregar campo
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function FormBuilder() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const isEdit    = Boolean(id);

  const [tmpl,   setTmpl]   = useState(emptyTmpl);
  const [errors, setErrors] = useState([]);
  const [savedId, setSavedId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['form-detail', id],
    queryFn: async () => (await formsAPI.get(Number(id))).data,
    enabled: isEdit,
    staleTime: 0,
  });

  useEffect(() => {
    if (existing) { setTmpl(deserialize(existing)); setSavedId(existing.id); }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async ({ payload, publish }) => {
      if (publish) payload.status = 'PUBLISHED';
      if (savedId) return (await formsAPI.update(savedId, payload)).data;
      return (await formsAPI.create(payload)).data;
    },
    onSuccess: (data) => {
      const newId = data.id ?? savedId;
      setSavedId(newId);
      setLastSaved(new Date());
      qc.invalidateQueries({ queryKey: ['forms-list'] });
      if (!savedId && newId) navigate(`/forms/${newId}`, { replace: true });
    },
    onError: (e) => {
      setErrors([e?.response?.data?.message ?? 'Error al guardar.']);
    },
  });

  const handleSave = (publish = false) => {
    const errs = validate(tmpl);
    if (errs.length) { setErrors(errs); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setErrors([]);
    saveMutation.mutate({ payload: serialize(tmpl), publish });
  };

  const addSection  = () => setTmpl((t) => ({ ...t, sections: [...t.sections, newSection(t.sections.length)] }));
  const updSection  = (i, s) => setTmpl((t) => { const ss = [...t.sections]; ss[i] = s; return { ...t, sections: ss }; });
  const delSection  = (i)    => setTmpl((t) => ({ ...t, sections: t.sections.filter((_, x) => x !== i) }));
  const moveSection = (i, d) => setTmpl((t) => {
    const ss = [...t.sections]; const j = i + d;
    if (j < 0 || j >= ss.length) return t;
    [ss[i], ss[j]] = [ss[j], ss[i]]; return { ...t, sections: ss };
  });

  const totalFields = tmpl.sections.reduce((s, sec) => s + sec.fields.length, 0);
  const totalScore  = tmpl.sections.reduce((s, sec) => s + sec.fields.reduce((fs, f) => fs + (f.score || 0), 0), 0);

  if (isEdit && isLoading) {
    return <div className="flex justify-center py-20"><div className="spin w-8 h-8 border-4 border-gray-200 border-t-brand-500 rounded-full" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in pb-24">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button className="text-xs text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1" onClick={() => navigate('/forms')}>
            ← Volver
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Editar formulario' : 'Nuevo formulario'}
          </h2>
          {lastSaved && <p className="text-xs text-green-600 mt-0.5">✓ Guardado {lastSaved.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" disabled={saveMutation.isPending} onClick={() => handleSave(false)}>
            💾 Borrador
          </button>
          <button className="btn btn-primary btn-sm" disabled={saveMutation.isPending} onClick={() => handleSave(true)}>
            🚀 Publicar
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold text-red-700 mb-1">Corrige los errores:</p>
          <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Metadata */}
      <div className="card space-y-4">
        <h3 className="section-title">Información del formulario</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Nombre *</label>
            <input className="input" value={tmpl.name}
              onChange={(e) => setTmpl((t) => ({ ...t, name: e.target.value }))}
              placeholder="Auditoría de Historia Clínica" />
          </div>
          <div>
            <label className="label">Versión</label>
            <input className="input" value={tmpl.version}
              onChange={(e) => setTmpl((t) => ({ ...t, version: e.target.value }))} />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="select" value={tmpl.formType}
              onChange={(e) => setTmpl((t) => ({ ...t, formType: e.target.value }))}>
              {FORM_TYPES.map((v) => (
                <option key={v} value={v}>{v || '— Sin categoría —'}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={tmpl.isActive}
                onChange={(e) => setTmpl((t) => ({ ...t, isActive: e.target.checked }))} />
              Activo
            </label>
            <span className={`badge ${tmpl.status === 'PUBLISHED' ? 'badge-green' : 'badge-gray'}`}>
              {tmpl.status === 'PUBLISHED' ? '✓ Publicado' : '⏳ Borrador'}
            </span>
          </div>
          <div className="col-span-2">
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={2} value={tmpl.description}
              onChange={(e) => setTmpl((t) => ({ ...t, description: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="section-title mb-0">
            Secciones ({tmpl.sections.length}) · {totalFields} campos · {totalScore.toFixed(1)} pts
          </h3>
          <button className="btn btn-primary btn-sm" onClick={addSection}>+ Sección</button>
        </div>

        {tmpl.sections.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm text-gray-500">Sin secciones. Agrega la primera.</p>
            <button className="btn btn-primary btn-sm mt-3" onClick={addSection}>+ Agregar sección</button>
          </div>
        )}

        {tmpl.sections.map((sec, si) => (
          <SectionCard key={sec._id} section={sec} si={si} total={tmpl.sections.length}
            onChange={(upd) => updSection(si, upd)}
            onDelete={() => delSection(si)}
            onUp={() => moveSection(si, -1)}
            onDown={() => moveSection(si, 1)} />
        ))}

        {tmpl.sections.length > 0 && (
          <button className="btn btn-ghost btn-sm w-full border border-dashed border-gray-200 hover:border-brand-300 hover:text-brand-600"
            onClick={addSection}>
            + Agregar sección
          </button>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">
            {tmpl.sections.length} secc · {totalFields} campos · {totalScore.toFixed(1)} pts
          </span>
          <button className="btn btn-ghost btn-sm" disabled={saveMutation.isPending} onClick={() => handleSave(false)}>
            {saveMutation.isPending ? '…' : '💾 Borrador'}
          </button>
          <button className="btn btn-primary btn-sm" disabled={saveMutation.isPending} onClick={() => handleSave(true)}>
            {saveMutation.isPending ? '…' : '🚀 Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
