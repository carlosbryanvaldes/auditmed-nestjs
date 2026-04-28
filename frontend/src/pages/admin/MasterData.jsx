import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterAPI } from '../../api/client';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-bold text-gray-900">{title}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

const EMPTY = { name: '', code: '', address: '' };

export default function MasterData() {
  const qc = useQueryClient();
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [err, setErr]         = useState('');

  const { data: unidades = [], isLoading } = useQuery({
    queryKey: ['unidades'],
    queryFn: async () => (await masterAPI.listUnidades()).data,
    staleTime: 60_000,
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErr(''); setModal(true); };
  const openEdit   = (u)  => { setEditing(u); setForm({ name: u.name, code: u.code ?? '', address: u.address ?? '' }); setErr(''); setModal(true); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, code: form.code || undefined, address: form.address || undefined };
      if (editing) return masterAPI.updateUnidad(editing.id, payload);
      return masterAPI.createUnidad(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['unidades'] }); setModal(false); },
    onError: (e) => setErr(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => masterAPI.deleteUnidad(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unidades'] }),
  });

  return (
    <div className="space-y-4 fade-in">
      {modal && (
        <Modal title={editing ? 'Editar unidad' : 'Nueva unidad ejecutora'} onClose={() => setModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Código</label>
              <input className="input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="SEDE_01" />
            </div>
            <div>
              <label className="label">Dirección</label>
              <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" disabled={saveMutation.isPending || !form.name}
                onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? '…' : editing ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Datos maestros</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Nueva unidad</button>
      </div>

      <div className="card">
        <h3 className="section-title">Unidades ejecutoras</h3>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="spin w-5 h-5 border-4 border-gray-200 border-t-brand-500 rounded-full" />
          </div>
        ) : unidades.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin unidades registradas.</p>
        ) : (
          <div className="space-y-2">
            {unidades.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                <div>
                  <span className="text-sm font-medium text-gray-900">{u.name}</span>
                  {u.code && <span className="ml-2 badge badge-gray text-[10px]">{u.code}</span>}
                  {u.address && <div className="text-xs text-gray-400 mt-0.5">{u.address}</div>}
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✏️</button>
                  <button
                    className="btn btn-ghost btn-sm text-red-400 hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => { if (confirm(`¿Eliminar "${u.name}"?`)) deleteMutation.mutate(u.id); }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
