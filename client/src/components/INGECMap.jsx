import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';
import { GOOGLE_MAPS_KEY, NIGERIA_CENTER, NIGERIA_ZOOM, MAP_LIBRARIES } from '../lib/maps';

const STATUS_COLORS = {
  ACTIVE: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  COMPLETED: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  ABANDONED: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  PROTECTED: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  SUSPENDED: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
};

export default function INGECMap({ projects = [] }) {
  const [selected, setSelected] = useState(null);

  // Safely render the map. If the API key is invalid or fails, it might throw ApiNotActivatedMapError.
  // The react-google-maps/api LoadScript should handle this but let's avoid objects-as-children crashes.
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY || ''} libraries={MAP_LIBRARIES}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px', borderRadius: '0.5rem' }}
        center={NIGERIA_CENTER}
        zoom={NIGERIA_ZOOM}
      >
        {projects.filter(p => p.latitude && p.longitude).map(p => (
          <Marker
            key={p.id}
            position={{ lat: Number(p.latitude), lng: Number(p.longitude) }}
            icon={STATUS_COLORS[p.status] || STATUS_COLORS.ACTIVE}
            onClick={() => setSelected(p)}
          />
        ))}
        {/* Render infowindow separately avoiding conditional child evaluation issues */}
        {selected ? (
          <InfoWindow
            position={{ lat: Number(selected.latitude), lng: Number(selected.longitude) }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg mb-1">{selected.project_name}</h3>
              <p className="text-sm">Status: <span className="font-medium">{selected.status}</span></p>
              <p className="text-sm">Completion: <span className="font-medium">{selected.completion_pct}%</span></p>
              <p className="text-sm">Budget: <span className="font-medium">₦{selected.approved_budget?.toLocaleString()}</span></p>
              <a href={`/projects/${selected.id}`} className="text-blue-600 text-sm mt-2 inline-block hover:underline">View Details</a>
            </div>
          </InfoWindow>
        ) : <></>}
      </GoogleMap>
    </LoadScript>
  );
}
