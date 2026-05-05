import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { bitacoraAPI } from '../../api/client';

const EVENTOS = [
  { tipo: 'ALTA',             label: '✅ Alta médica',      color: 'border-green-300 bg-green-50 text-green-800' },
  { tipo: 'FALLECIDO',        label: '🕊 Fallecido',        color: 'border-gray-400 bg-gray-100 text-gray-800' },
  { tipo: 'COMPLICACION',     label: '⚠ Complicación',     color: 'border-red-300 bg-red-50 text-red-800' },
  { tipo: 'TRASLADO_INTERNO', label: '🔄 Traslado interno', color: 'border-yellow-300 bg-yellow-50 text-yellow-800' },
  { tipo: 'TRASLADO_EXTERNO', label: '🚑 Traslado externo', color: 'border-orange-300 bg-orange-50 text-orange-800' },
];

const COMPLICACIONES_SUGERIDAS = [
  'Deterioro hemodinámico',
  'Insuficiencia respiratoria aguda',
  'Sepsis',
  'Hemorragia activa',
  'Crisis convulsiva',
  'PCR',
  'Otra',
];

export default function RegistrarEvento({ bitacoraId, paciente, onClose, onSuccess }) {
  const [tipoEvento, setTipoEvento]   = useState(null);
  const [detalle, setDetalle]         = useState('');
  const [confirmar, setConfirmar]     = useState(false);

  const eventMut = useMutation({
    mutationFn: () =>
      bitacoraAPI.registrarEvento(bitacoraId, paciente.id, {
        tipoEvento,
        detalle: detalle || undefined,
      }),
    onSuccess: onSuccess,
    onError: (e) => alert(e.response?.data?.message ?? 'Error al registrar evento'),
  });

  const diasLabel = paciente.diasEstancia === 0
    ? 'Ingresado hoy'
    : `${paciente.diasEstancia} día${paciente.diasEstancia !== 1 ? 's' : ''} de estancia`;

  // ── Selección de tipo ────────────────────────────────────────────────────
  if (!tipoEvento) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Registrar evento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          {/* Resumen estancia */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
            <span className="font-medium">Paciente #{paciente.id.slice(-6).toUpperCase()}</span>
            <span className="text-gray-400 mx-2">·</span>
            <span>{diasLabel}</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {EVENTOS.map(ev => (
              <button
                key={ev.tipo}
                onClick={() => setTipoEvento(ev.tipo)}
                className={`border-2 rounded-xl px-4 py-3 text-sm font-semibold text-left ${ev.color} hover:opacity-80`}
              >
                {ev.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Detalle del evento ───────────────────────────────────────────────────
  const eventoMeta = EVENTOS.find(e => e.tipo === tipoEvento);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{eventoMeta.label}</h2>
          <button onClick={() => setTipoEvento(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Resumen de estancia */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
          <div className="font-semibold text-blue-900">
            Paciente #{paciente.id.slice(-6).toUpperCase()}
          </div>
          <div className="text-blue-700 mt-0.5">{diasLabel}</div>
        </div>

        {/* Campo detalle */}
        {tipoEvento === 'COMPLICACION' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Tipo de complicación</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMPLICACIONES_SUGERIDAS.map(c => (
                <button
                  key={c}
                  onClick={() => setDetalle(c === 'Otra' ? '' : c)}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    detalle === c
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              value={detalle}
              onChange={e => setDetalle(e.target.value)}
              placeholder="Descripción libre…"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>
        )}

        {tipoEvento === 'TRASLADO_INTERNO' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Servicio destino</label>
            <input
              type="text"
              value={detalle}
              onChange={e => setDetalle(e.target.value)}
              placeholder="Ej: UCI, Cirugía…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}

        {tipoEvento === 'TRASLADO_EXTERNO' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Institución / motivo</label>
            <input
              type="text"
              value={detalle}
              onChange={e => setDetalle(e.target.value)}
              placeholder="Hospital destino o motivo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* Confirmación */}
        {!confirmar ? (
          <button
            onClick={() => setConfirmar(true)}
            className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-lg hover:bg-brand-700"
          >
            Continuar
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <strong>Confirmar registro:</strong> {eventoMeta.label}
              {detalle && <><br /><span className="text-xs">{detalle}</span></>}
              <br /><span className="text-xs text-gray-500">{diasLabel}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmar(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => eventMut.mutate()}
                disabled={eventMut.isPending}
                className="flex-1 bg-brand-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                {eventMut.isPending ? 'Guardando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
