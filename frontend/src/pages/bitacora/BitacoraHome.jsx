import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { bitacoraAPI } from '../../api/client';
import IngresarPaciente from './IngresarPaciente';
import RegistrarEvento from './RegistrarEvento';

const TURNOS = [
  { value: 'MANANA',    label: '🌅 Mañana' },
  { value: 'TARDE',     label: '🌤 Tarde' },
  { value: 'NOCHE',     label: '🌙 Noche' },
  { value: 'GUARDIA_24',label: '🔄 Guardia 24h' },
  { value: 'ESPECIAL',  label: '⭐ Especial' },
];

function BadgeEstado({ estado }) {
  const map = {
    ACTIVO:           'bg-green-100 text-green-800',
    COMPLICACION:     'bg-red-100 text-red-800',
    TRASLADO_INTERNO: 'bg-yellow-100 text-yellow-800',
    TRASLADO_EXTERNO: 'bg-orange-100 text-orange-800',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[estado] ?? 'bg-gray-100 text-gray-600'}`}>
      {estado.replace('_', ' ')}
    </span>
  );
}

function PacienteRow({ paciente, onEvento }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-700">
        #{paciente.id.slice(-6).toUpperCase()}
      </td>
      <td className="px-4 py-3">
        <BadgeEstado estado={paciente.estado} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {paciente.diasEstancia === 0 ? 'Hoy' : `${paciente.diasEstancia}d`}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onEvento(paciente)}
          className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1 rounded-lg font-medium"
        >
          Registrar evento
        </button>
      </td>
    </tr>
  );
}

export default function BitacoraHome() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // ── Estado de apertura de turno ──────────────────────────────────────────
  const [bitacoraId, setBitacoraId] = useState(null);
  const [turno, setTurno]           = useState('MANANA');
  const [supervisor, setSupervisor] = useState('');
  const [sedeId, setSedeId]         = useState('');
  const [servicioId, setServicioId] = useState('');
  const [geoStatus, setGeoStatus]   = useState('idle'); // idle | checking | ok | error

  // ── Modals ───────────────────────────────────────────────────────────────
  const [modalIngreso, setModalIngreso]   = useState(false);
  const [modalEvento, setModalEvento]     = useState(null); // paciente seleccionado

  // ── Sedes ────────────────────────────────────────────────────────────────
  const { data: sedes = [] } = useQuery({
    queryKey: ['bitacora-sedes'],
    queryFn: () => bitacoraAPI.listarSedes().then(r => r.data),
  });

  const sedeSeleccionada = sedes.find(s => s.id === sedeId);
  const servicios = sedeSeleccionada?.servicios ?? [];

  // ── Pacientes activos ────────────────────────────────────────────────────
  const { data: pacientes = [], refetch: refetchPacientes } = useQuery({
    queryKey: ['bitacora-pacientes', bitacoraId],
    queryFn: () => bitacoraAPI.getPacientes(bitacoraId).then(r => r.data),
    enabled: !!bitacoraId,
    refetchInterval: 30_000,
  });

  // ── Stats derivadas ──────────────────────────────────────────────────────
  const stats = {
    total:        pacientes.length,
    nuevosHoy:    pacientes.filter(p => p.diasEstancia === 0).length,
    conEvento:    pacientes.filter(p => p.eventos?.length > 1).length,
    complicacion: pacientes.filter(p => p.estado === 'COMPLICACION').length,
  };

  // ── Geolocalización ──────────────────────────────────────────────────────
  const [coordenadas, setCoordenadas] = useState(null);

  const solicitarGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('ok');
      },
      () => setGeoStatus('error'),
      { timeout: 10_000 },
    );
  }, []);

  useEffect(() => { solicitarGeo(); }, [solicitarGeo]);

  // ── Abrir turno ──────────────────────────────────────────────────────────
  const abrirTurnoMut = useMutation({
    mutationFn: () =>
      bitacoraAPI.crear({
        turno, supervisor, sedeId, servicioId,
        latitud:  coordenadas?.lat,
        longitud: coordenadas?.lng,
      }),
    onSuccess: (res) => {
      setBitacoraId(res.data.id);
      qc.invalidateQueries(['bitacora-pacientes']);
    },
    onError: (e) => alert(e.response?.data?.message ?? 'Error al abrir turno'),
  });

  // ── Cerrar turno ─────────────────────────────────────────────────────────
  const cerrarTurnoMut = useMutation({
    mutationFn: () => bitacoraAPI.cerrar(bitacoraId),
    onSuccess: () => {
      setBitacoraId(null);
      qc.invalidateQueries(['bitacora-pacientes']);
    },
    onError: (e) => alert(e.response?.data?.message ?? 'Error al cerrar turno'),
  });

  // ── Callbacks de modals ──────────────────────────────────────────────────
  const onPacienteIngresado = () => {
    setModalIngreso(false);
    refetchPacientes();
  };
  const onEventoRegistrado = () => {
    setModalEvento(null);
    refetchPacientes();
  };

  // ── Vista: apertura de turno ─────────────────────────────────────────────
  if (!bitacoraId) {
    return (
      <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">📋 Abrir turno de Bitácora</h1>

        {/* Geo status */}
        <div className={`text-xs px-3 py-2 rounded-lg ${
          geoStatus === 'ok'       ? 'bg-green-50 text-green-700' :
          geoStatus === 'checking' ? 'bg-yellow-50 text-yellow-700' :
          geoStatus === 'error'    ? 'bg-red-50 text-red-700' :
                                     'bg-gray-50 text-gray-500'
        }`}>
          {geoStatus === 'ok'       && '✓ Ubicación verificada'}
          {geoStatus === 'checking' && '⏳ Verificando ubicación…'}
          {geoStatus === 'error'    && '⚠ No se pudo obtener ubicación — se abrirá sin validación geo'}
          {geoStatus === 'idle'     && '📍 Esperando permiso de ubicación'}
        </div>

        <div className="space-y-3">
          {/* Turno */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Turno</label>
            <select
              value={turno}
              onChange={e => setTurno(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {TURNOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Sede */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sede clínica</label>
            <select
              value={sedeId}
              onChange={e => { setSedeId(e.target.value); setServicioId(''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Seleccionar sede…</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Servicio</label>
            <select
              value={servicioId}
              onChange={e => setServicioId(e.target.value)}
              disabled={!sedeId}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Seleccionar servicio…</option>
              {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          {/* Supervisor */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Supervisor de turno</label>
            <input
              type="text"
              value={supervisor}
              onChange={e => setSupervisor(e.target.value)}
              placeholder="Nombre del supervisor"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <button
          onClick={() => abrirTurnoMut.mutate()}
          disabled={!turno || !supervisor || !sedeId || !servicioId || abrirTurnoMut.isPending}
          className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {abrirTurnoMut.isPending ? 'Abriendo…' : 'Abrir turno'}
        </button>
      </div>
    );
  }

  // ── Vista: turno activo ──────────────────────────────────────────────────
  const nuevos    = pacientes.filter(p => p.diasEstancia === 0);
  const anteriores = pacientes.filter(p => p.diasEstancia > 0);

  return (
    <div className="space-y-4">
      {/* Header turno */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📋 Bitácora — Turno activo</h1>
          <p className="text-sm text-gray-500">
            {user?.fullName} · {TURNOS.find(t => t.value === turno)?.label} · Supervisor: {supervisor}
          </p>
        </div>
        <button
          onClick={() => { if (confirm('¿Cerrar el turno?')) cerrarTurnoMut.mutate(); }}
          disabled={cerrarTurnoMut.isPending}
          className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-sm font-medium px-4 py-2 rounded-lg"
        >
          Cerrar turno
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Hospitalizados', value: stats.total,        color: 'text-brand-700' },
          { label: 'Nuevos hoy',     value: stats.nuevosHoy,    color: 'text-green-700' },
          { label: 'Con evento',     value: stats.conEvento,    color: 'text-yellow-700' },
          { label: 'Complicaciones', value: stats.complicacion, color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="flex justify-end">
        <button
          onClick={() => setModalIngreso(true)}
          className="bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-700"
        >
          + Ingresar paciente
        </button>
      </div>

      {/* Tabla pacientes */}
      {pacientes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          Sin pacientes hospitalizados en este turno
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {nuevos.length > 0 && (
            <>
              <div className="px-4 py-2 bg-green-50 text-xs font-semibold text-green-700 border-b border-gray-100">
                Nuevos hoy ({nuevos.length})
              </div>
              <table className="w-full">
                <tbody>
                  {nuevos.map(p => (
                    <PacienteRow key={p.id} paciente={p} onEvento={setModalEvento} />
                  ))}
                </tbody>
              </table>
            </>
          )}
          {anteriores.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-100">
                Días anteriores ({anteriores.length})
              </div>
              <table className="w-full">
                <tbody>
                  {anteriores.map(p => (
                    <PacienteRow key={p.id} paciente={p} onEvento={setModalEvento} />
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {modalIngreso && (
        <IngresarPaciente
          bitacoraId={bitacoraId}
          onClose={() => setModalIngreso(false)}
          onSuccess={onPacienteIngresado}
        />
      )}
      {modalEvento && (
        <RegistrarEvento
          bitacoraId={bitacoraId}
          paciente={modalEvento}
          onClose={() => setModalEvento(null)}
          onSuccess={onEventoRegistrado}
        />
      )}
    </div>
  );
}
