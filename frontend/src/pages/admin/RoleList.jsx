import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesAPI } from '../../api/client';

export default function RoleList() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [editing, setEditing]   = useState([]);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await rolesAPI.list()).data,
    staleTime: 60_000,
  });
  const { data: allPerms = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await rolesAPI.permissions()).data,
  });

  const openRole = (role) => {
    setSelected(role);
    setEditing(role.rolePermissions.map((rp) => rp.permissionId));
  };

  const saveMutation = useMutation({
    mutationFn: () => rolesAPI.updatePermissions(selected.id, editing),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setSelected(data.data);
      setEditing(data.data.rolePermissions.map((rp) => rp.permissionId));
    },
  });

  const togglePerm = (id) =>
    setEditing((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);

  // Group perms by module
  const grouped = allPerms.reduce((acc, p) => {
    (acc[p.module] = acc[p.module] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4 fade-in">
      <h2 className="text-xl font-bold text-gray-900">Roles y Permisos</h2>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Role list */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-6"><div className="spin w-5 h-5 border-4 border-gray-200 border-t-brand-500 rounded-full" /></div>
          ) : roles.map((r) => (
            <button
              key={r.id}
              className={`w-full card-sm text-left hover:border-brand-300 transition ${selected?.id === r.id ? 'border-brand-500 bg-brand-50' : ''}`}
              onClick={() => openRole(r)}
            >
              <div className="font-semibold text-sm">{r.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{r._count?.users ?? 0} usuarios · {r.rolePermissions?.length ?? 0} permisos</div>
              {r.description && <div className="text-xs text-gray-400 mt-0.5 truncate">{r.description}</div>}
            </button>
          ))}
        </div>

        {/* Permissions editor */}
        {selected && (
          <div className="lg:col-span-2 card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Permisos: {selected.name}</h3>
              <button
                className="btn btn-primary btn-sm"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? '…' : '💾 Guardar'}
              </button>
            </div>
            {Object.entries(grouped).map(([module, perms]) => (
              <div key={module}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{module}</p>
                <div className="space-y-1">
                  {perms.map((p) => (
                    <label key={p.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={editing.includes(p.id)}
                        onChange={() => togglePerm(p.id)}
                      />
                      <div>
                        <span className="text-sm font-mono text-gray-700">{p.name}</span>
                        {p.description && <span className="text-xs text-gray-400 ml-2">{p.description}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
