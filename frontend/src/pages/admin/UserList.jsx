import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, rolesAPI } from '../../api/client';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <span className="font-bold text-gray-900">{title}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const EMPTY = { username: '', email: '', password: '', fullName: '', roleId: '', status: 'ACTIVE' };

export default function UserList() {
  const qc = useQueryClient();
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [err, setErr]       = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await usersAPI.list()).data,
    staleTime: 60_000,
  });
  const { data: roles = [] } = useQuery({
    queryKey: ['roles-simple'],
    queryFn: async () => (await rolesAPI.list()).data,
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErr(''); setModal(true); };
  const openEdit   = (u)  => { setEditing(u); setForm({ username: u.username, email: u.email, password: '', fullName: u.fullName, roleId: String(u.roleId), status: u.status }); setErr(''); setModal(true); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, roleId: Number(form.roleId) };
      if (!payload.password) delete payload.password;
      if (editing) return (await usersAPI.update(editing.id, payload)).data;
      return (await usersAPI.create(payload)).data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(false); },
    onError: (e) => setErr(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const toggleMutation = useMutation({
    mutationFn: (u) => usersAPI.update(u.id, { status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div className="space-y-4 fade-in">
      {modal && (
        <Modal title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setModal(false)}>
          <div className="space-y-3">
            {!editing && (
              <div>
                <label className="label">Usuario *</label>
                <input className="input" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="label">Nombre completo *</label>
              <input className="input" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">{editing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
              <input className="input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="label">Rol *</label>
              <select className="select" value={form.roleId} onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}>
                <option value="">— Seleccionar —</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? '…' : editing ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Usuarios</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo usuario</button>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">Nombre</th>
              <th className="table-th">Usuario</th>
              <th className="table-th">Email</th>
              <th className="table-th">Rol</th>
              <th className="table-th">Estado</th>
              <th className="table-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="py-10 text-center"><div className="spin w-5 h-5 border-4 border-gray-200 border-t-brand-500 rounded-full mx-auto" /></td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{u.fullName}</td>
                <td className="table-td font-mono text-xs text-gray-600">{u.username}</td>
                <td className="table-td text-sm text-gray-600">{u.email}</td>
                <td className="table-td"><span className="badge badge-blue">{u.role?.name}</span></td>
                <td className="table-td">
                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                    {u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="table-td">
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✏️</button>
                    <button
                      className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-ghost text-red-500 hover:bg-red-50' : 'btn-ghost text-green-600 hover:bg-green-50'}`}
                      disabled={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate(u)}
                    >
                      {u.status === 'ACTIVE' ? '🔒' : '🔓'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
