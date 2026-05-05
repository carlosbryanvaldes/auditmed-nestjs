/**
 * MapPicker — selecciona lat/lng haciendo clic en el mapa.
 * Usa OpenStreetMap (sin API key) vía react-leaflet v5.
 */
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's broken default icon URLs in Vite/webpack builds
import iconUrl       from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl     from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const DEFAULT_CENTER = [8.9936, -79.5197]; // Ciudad de Panamá
const DEFAULT_ZOOM   = 13;

/** Componente interno que captura clics y mueve el mapa si la posición cambia. */
function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Centra el mapa cuando se provee una nueva posición externamente (ej: al abrir editar). */
function AutoCenter({ lat, lng }) {
  const map = useMapEvents({});
  const prevRef = useRef(null);

  useEffect(() => {
    const key = `${lat},${lng}`;
    if (lat && lng && key !== prevRef.current) {
      prevRef.current = key;
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);

  return null;
}

/**
 * @param {number|string} lat
 * @param {number|string} lng
 * @param {number} radio        — radio en metros para mostrar círculo (opcional)
 * @param {Function} onChange   — callback(lat: number, lng: number)
 */
export default function MapPicker({ lat, lng, radio = 0, onChange }) {
  const hasPin   = lat !== '' && lat != null && lng !== '' && lng != null;
  const position = hasPin ? [parseFloat(lat), parseFloat(lng)] : null;
  const center   = position ?? DEFAULT_CENTER;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 280 }}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {position && <AutoCenter lat={lat} lng={lng} />}
        {position && <Marker position={position} />}
        {position && radio > 0 && (
          <Circle
            center={position}
            radius={radio}
            pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.12 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
