import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NIGERIA_CENTER, NIGERIA_ZOOM } from '../lib/maps';

// Create custom icons representing the different statuses using Leaflet's L.Icon
const getCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const STATUS_ICONS = {
  ACTIVE: getCustomIcon('blue'),
  COMPLETED: getCustomIcon('green'),
  ABANDONED: getCustomIcon('red'),
  PROTECTED: getCustomIcon('yellow'),
  SUSPENDED: getCustomIcon('orange'),
};

export default function INGECMap({ projects = [] }) {
  // Center is an array [lat, lng] for Leaflet
  const centerPosition = [NIGERIA_CENTER.lat, NIGERIA_CENTER.lng];

  return (
    <div style={{ width: '100%', height: '600px', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <MapContainer
        center={centerPosition}
        zoom={NIGERIA_ZOOM}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {projects.filter(p => p.latitude && p.longitude).map(p => (
          <Marker
            key={p.id}
            position={[Number(p.latitude), Number(p.longitude)]}
            icon={STATUS_ICONS[p.status] || STATUS_ICONS.ACTIVE}
          >
            <Popup>
              <div className="min-w-[200px] pb-1">
                <h3 className="font-bold text-lg mb-1">{p.project_name}</h3>
                <p className="text-sm m-0 leading-relaxed">Status: <span className="font-medium">{p.status}</span></p>
                <p className="text-sm m-0 leading-relaxed">Completion: <span className="font-medium">{p.completion_pct}%</span></p>
                <p className="text-sm m-0 leading-relaxed">Budget: <span className="font-medium">₦{p.approved_budget?.toLocaleString()}</span></p>
                <a href={`/projects/${p.id}`} className="text-blue-600 text-sm mt-2 font-semibold inline-block hover:underline">View Details</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
