import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bitacoraAPI } from '../../api/client';
import MapPicker from '../../components/MapPicker';

function Modal({ title, onClose, wide, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full mx-4 ${wide ? 'max-w-lg' : 'max-w-sm'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-bold text-gray-900">{title}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="px-5 py-4 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}

// ── Pestaña Sedes ─────────────────────────────────────────────────────────────
const SEDE_EMPTY = { nombre: '', latitud: '', longitud: '', radioMetros: '200' };

function SedesTab() {
  const qc = useQueryClient();
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(SEDE_EMPTY);
  const [err, setErr]         = useState('');

  const { data: sedes = [], isLoading } = useQuery({
    queryKey: ['admin-sedes'],
    queryFn: async () => (await bitacoraAPI.adminListarSedes()).data,
    staleTime: 60_000,
  });

  const openCreate = () => { setEditing(null); setForm(SEDE_EMPTY); setErr(''); setModal(true); };
  const openEdit   = (s) => {
    setEditing(s);
    setForm({ nombre: s.nombre, latitud: s.latitud, longitud: s.longitud, radioMetros: String(s.radioMetros) });
    setErr('');
    setModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nombre:      form.nombre,
        latitud:     parseFloat(form.latitud),
        longitud:    parseFloat(form.longitud),
        radioMetros: parseInt(form.radioMetros, 10) || 200,
      };
      if (editing) return bitacoraAPI.adminActualizarSede(editing.id, payload);
      return bitacoraAPI.adminCrearSede(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-sedes'] }); setModal(false); },
    onError: (e) => setErr(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bitacoraAPI.adminEliminarSede(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sedes'] }),
    onError: (e) => alert(e?.response?.data?.message ?? 'Error al eliminar'),
  });

  const valid = form.nombre && form.latitud !== '' && form.longitud !== '';

  return (
    <>
      {modal && (
        <Modal title={editing ? 'Editar sede' : 'Nueva sede clínica'} onClose={() => setModal(false)} wide>
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="label">Nombre *</label>
              <input
                className="input"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Hospital Central"
              />
            </div>

            {/* Mapa */}
            <div>
              <label className="label">
                Ubicación * — <span className="text-gray-400 font-normal">haz clic en el mapa para colocar el pin</span>
              </label>
              <MapPicker
                lat={form.latitud}
                lng={form.longitud}
                radio={parseInt(form.radioMetros, 10) || 200}
                onChange={(lat, lng) => setForm((f) => ({ ...f, latitud: lat, longitud: lng }))}
              />
              {form.latitud !== '' && form.longitud !== '' ? (
                <p className="text-xs text-gray-400 mt-1">
                  📍 {parseFloat(form.latitud).toFixed(6)}, {parseFloat(form.longitud).toFixed(6)}
                </p>
              ) : (
                <p className="text-xs text-amber-500 mt-1">⚠️ Sin ubicación — haz clic en el mapa</p>
              )}
            </div>

            {/* Radio */}
            <div>
              <label className="label">Radio de validación geográfica (metros)</label>
              <div className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={form.radioMetros}
                  onChange={(e) => setForm((f) => ({ ...f, radioMetros: e.target.value }))}
                />
                <span className="text-sm font-medium text-gray-700 w-16 text-right">{form.radioMetros} m</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                El círculo violeta en el mapa muestra el área de cobertura.
              </p>
            </div>

            {err && <p className="text-xs text-red-600">{err}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>Cancelar</button>
              <button
                className="btn btn-primary btn-sm"
                disabled={saveMutation.isPending || !valid}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? '…' : editing ? 'Guardar cambios' : 'Crear sede'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">Gestiona las sedes clínicas y su radio de geolocalización.</p>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Nueva sede</button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="spin w-5 h-5 border-4 border-gray-200 border-t-brand-500 rounded-full" />
          </div>
        ) : sedes.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin sedes registradas.</p>
        ) : (
          <div className="space-y-2">
            {sedes.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">🏥 {s.nombre}</span>
                    {!s.activa && <span className="badge badge-gray text-[10px]">Inactiva</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    📍 {parseFloat(s.latitud).toFixed(5)}, {parseFloat(s.longitud).toFixed(5)} · Radio: {s.radioMetros} m
                  </div>
                  {s._count?.servicios !== undefined && (
                    <div className="text-xs text-gray-400">{s._count.servicios} servicio(s)</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                  <button
                    className="btn btn-ghost btn-sm text-red-400 hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => { if (confirm(`¿Desactivar la sede "${s.nombre}"?`)) deleteMutation.mutate(s.id); }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Pestaña Servicios ─────────────────────────────────────────────────────────
const SERV_EMPTY = { nombre: '', sedeId: '' };

function ServiciosTab() {
  const qc = useQueryClient();
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(SERV_EMPTY);
  const [filterSede, setFilter] = useState('');
  const [err, setErr]           = useState('');

  const { data: sedes = [] } = useQuery({
    queryKey: ['admin-sedes'],
    queryFn: async () => (await bitacoraAPI.adminListarSedes()).data,
    staleTime: 60_000,
  });

  const { data: servicios = [], isLoading } = useQuery({
    queryKey: ['admin-servicios', filterSede],
    queryFn: async () => (await bitacoraAPI.adminListarServicios(filterSede || undefined)).data,
    staleTime: 60_000,
  });

  const openCreate = () => { setEditing(null); setForm(SERV_EMPTY); setErr(''); setModal(true); };
  const openEdit   = (s) => {
    setEditing(s);
    setForm({ nombre: s.nombre, sedeId: s.sedeId });
    setErr('');
    setModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return bitacoraAPI.adminActualizarServicio(editing.id, { nombre: form.nombre });
      return bitacoraAPI.adminCrearServicio({ nombre: form.nombre, sedeId: form.sedeId });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-servicios'] }); setModal(false); },
    onError: (e) => setErr(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bitacoraAPI.adminEliminarServicio(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-servicios'] }),
    onError: (e) => alert(e?.response?.data?.message ?? 'Error al eliminar'),
  });

  const valid = form.nombre && (editing || form.sedeId);
  const sedeNombre = (id) => sedes.find((s) => s.id === id)?.nombre ?? id;

  return (
    <>
      {modal && (
        <Modal title={editing ? 'Editar servicio' : 'Nuevo servicio'} onClose={() => setModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="label">Nombre *</label>
              <input
                className="input"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Emergencias"
              />
            </div>
            {!editing && (
              <div>
                <label className="label">Sede *</label>
                <select
                  className="input"
                  value={form.sedeId}
                  onChange={(e) => setForm((f) => ({ ...f, sedeId: e.target.value }))}
                >
                  <option value="">Seleccionar sede…</option>
                  {sedes.filter((s) => s.activa).map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>Cancelar</button>
              <button
                className="btn btn-primary btn-sm"
                disabled={saveMutation.isPending || !valid}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? '…' : editing ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Filtrar por sede:</label>
          <select className="input text-sm py-1 h-auto" value={filterSede} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todas</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Nuevo servicio</button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="spin w-5 h-5 border-4 border-gray-200 border-t-brand-500 rounded-full" />
          </div>
        ) : servicios.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin servicios registrados.</p>
        ) : (
          <div className="space-y-2">
            {servicios.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">🏨 {s.nombre}</span>
                    {!s.activo && <span className="badge badge-gray text-[10px]">Inactivo</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{sedeNombre(s.sedeId)}</div>
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                  <button
                    className="btn btn-ghost btn-sm text-red-400 hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => { if (confirm(`¿Desactivar el servicio "${s.nombre}"?`)) deleteMutation.mutate(s.id); }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'sedes',     label: '🏥 Sedes clínicas' },
  { id: 'servicios', label: '🏨 Servicios' },
];

export default function BitacoraAdmin() {
  const [tab, setTab] = useState('sedes');

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Administración — Bitácora</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition rounded-t-lg border-b-2 -mb-px ${
              tab === t.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sedes'     && <SedesTab />}
      {tab === 'servicios' && <ServiciosTab />}
    </div>
  );
}
