import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { bitacoraAPI } from '../../api/client';

// Hash SHA-256 del documento (en el navegador, sin enviar el número real)
async function sha256(text) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text.trim().toUpperCase()),
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Cifrado AES-GCM con clave derivada de la sesión (PBKDF2)
// Para el prototipo usamos btoa como placeholder; en producción reemplazar con WebCrypto completo.
function encriptar(texto) {
  return btoa(unescape(encodeURIComponent(texto)));
}

const TIPOS_DOC = [
  { value: 'CEDULA',             label: 'Cédula de identidad' },
  { value: 'PASAPORTE',          label: 'Pasaporte' },
  { value: 'CARNET_EXTRANJERIA', label: 'Carnet de extranjería' },
  { value: 'SIN_DOCUMENTO',      label: 'Sin documento' },
];

export default function IngresarPaciente({ bitacoraId, onClose, onSuccess }) {
  // Paso 1: documento
  const [paso, setPaso]               = useState(1);
  const [tipoDoc, setTipoDoc]         = useState('CEDULA');
  const [numeroDoc, setNumeroDoc]     = useState('');
  const [nombre, setNombre]           = useState('');
  const [fechaNac, setFechaNac]       = useState('');
  const [reingresoInfo, setReingresoInfo] = useState(null);

  const ingresoMut = useMutation({
    mutationFn: async () => {
      const hash = tipoDoc === 'SIN_DOCUMENTO'
        ? await sha256(`SIN_DOC_${Date.now()}`)
        : await sha256(numeroDoc);

      const enc  = encriptar(tipoDoc === 'SIN_DOCUMENTO' ? 'SIN_DOCUMENTO' : numeroDoc);
      const nEnc = encriptar(nombre);
      const fEnc = encriptar(fechaNac);

      return bitacoraAPI.ingresarPaciente(bitacoraId, {
        tipoDocumento: tipoDoc,
        documentoHash: hash,
        documentoEnc:  enc,
        nombreEnc:     nEnc,
        fechaNacEnc:   fEnc,
      });
    },
    onSuccess: (res) => {
      const { reingreso } = res.data;
      if (reingreso?.esReingreso) {
        setReingresoInfo(reingreso);
      } else {
        onSuccess();
      }
    },
    onError: (e) => alert(e.response?.data?.message ?? 'Error al ingresar paciente'),
  });

  // ── Paso 1: captura de documento ────────────────────────────────────────
  const renderPaso1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de documento</label>
        <select
          value={tipoDoc}
          onChange={e => setTipoDoc(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {TIPOS_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {tipoDoc !== 'SIN_DOCUMENTO' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Número de documento</label>
          <input
            type="text"
            value={numeroDoc}
            onChange={e => setNumeroDoc(e.target.value)}
            placeholder="Ingrese el número"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      <button
        onClick={() => setPaso(2)}
        disabled={tipoDoc !== 'SIN_DOCUMENTO' && !numeroDoc.trim()}
        className="w-full bg-brand-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  );

  // ── Paso 2: datos personales ────────────────────────────────────────────
  const renderPaso2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre del paciente"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de nacimiento</label>
        <input
          type="date"
          value={fechaNac}
          onChange={e => setFechaNac(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={() => setPaso(1)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">
          Atrás
        </button>
        <button
          onClick={() => ingresoMut.mutate()}
          disabled={!nombre.trim() || !fechaNac || ingresoMut.isPending}
          className="flex-1 bg-brand-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
        >
          {ingresoMut.isPending ? 'Ingresando…' : 'Confirmar ingreso'}
        </button>
      </div>
    </div>
  );

  // ── Alerta de reingreso ─────────────────────────────────────────────────
  const renderReingreso = () => (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <div className="font-semibold mb-1">⚠ Atención: reingreso reciente</div>
        <div>Este paciente tuvo una estancia previa en los últimos 30 días.</div>
        {reingresoInfo?.ultimaEstancia && (
          <div className="mt-1 text-xs text-amber-700">
            Último egreso: {new Date(reingresoInfo.ultimaEstancia.fechaEgreso).toLocaleDateString()}
          </div>
        )}
      </div>
      <button
        onClick={onSuccess}
        className="w-full bg-brand-600 text-white font-semibold py-2 rounded-lg"
      >
        Entendido — Continuar
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Ingresar paciente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {reingresoInfo   ? renderReingreso() :
         paso === 1      ? renderPaso1() :
                           renderPaso2()}
      </div>
    </div>
  );
}
