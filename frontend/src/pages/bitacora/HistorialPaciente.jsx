import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bitacoraAPI } from '../../api/client';

const EVENTO_ICON = {
  INGRESO:           { icon: '🏥', color: 'bg-green-100 text-green-700' },
  ALTA:              { icon: '✅', color: 'bg-blue-100 text-blue-700' },
  FALLECIDO:         { icon: '🕊',  color: 'bg-gray-200 text-gray-700' },
  COMPLICACION:      { icon: '⚠',  color: 'bg-red-100 text-red-700' },
  TRASLADO_INTERNO:  { icon: '🔄',  color: 'bg-yellow-100 text-yellow-700' },
  TRASLADO_EXTERNO:  { icon: '🚑',  color: 'bg-orange-100 text-orange-700' },
};

function EventoItem({ evento }) {
  const meta = EVENTO_ICON[evento.tipoEvento] ?? { icon: '•', color: 'bg-gray-100 text-gray-600' };
  return (
    <div className="flex gap-3 items-start">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 ${meta.color}`}>
        {meta.icon}
      </span>
      <div className="flex-1 min-w-0 pb-4 border-b border-gray-100">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {evento.tipoEvento.replace('_', ' ')}
          </span>
          {evento.detalle && (
            <span className="text-xs text-gray-500 truncate">{evento.detalle}</span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {new Date(evento.createdAt).toLocaleString()} ·{' '}
          {evento.registradoPor?.fullName ?? 'Usuario'} ·{' '}
          {evento.diasEstancia}d de estancia
        </div>
      </div>
    </div>
  );
}

function EstanciaCard({ estancia, index }) {
  const diasEgreso = estancia.fechaEgreso
    ? Math.floor((new Date(estancia.fechaEgreso) - new Date(estancia.fechaIngreso)) / (1000 * 60 * 60 * 24))
    : Math.floor((Date.now() - new Date(estancia.fechaIngreso).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-700">
            Estancia #{index + 1}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            {estancia.bitacoraIngreso?.sede?.nombre} — {estancia.bitacoraIngreso?.servicio?.nombre}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(estancia.fechaIngreso).toLocaleDateString()} →{' '}
          {estancia.fechaEgreso
            ? new Date(estancia.fechaEgreso).toLocaleDateString()
            : 'Activo'}
          {' · '}<strong>{diasEgreso}d</strong>
        </div>
      </div>
      <div className="p-4 space-y-0">
        {estancia.eventos.map(ev => <EventoItem key={ev.id} evento={ev} />)}
        {estancia.eventos.length === 0 && (
          <p className="text-xs text-gray-400">Sin eventos registrados</p>
        )}
      </div>
    </div>
  );
}

export default function HistorialPaciente() {
  const { hash } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bitacora-historial', hash],
    queryFn: () => bitacoraAPI.getHistorial(hash).then(r => r.data),
    enabled: !!hash,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 text-gray-400">Cargando historial…</div>
  );

  if (isError) return (
    <div className="text-red-600 p-4">Error al cargar el historial del paciente</div>
  );

  const { estancias = [], resumen = {} } = data ?? {};

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-900">📂 Historial del paciente</h1>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Estancias',    value: resumen.totalEstancias ?? 0 },
          { label: 'Días totales', value: resumen.totalDias ?? 0 },
          { label: 'Complicaciones', value: resumen.complicaciones ?? 0 },
          { label: 'Reingresos',   value: resumen.reingresos ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-700">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Línea de tiempo */}
      {estancias.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-10">Sin estancias registradas</div>
      ) : (
        estancias.map((e, i) => <EstanciaCard key={e.id} estancia={e} index={i} />)
      )}
    </div>
  );
}
