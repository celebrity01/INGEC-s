import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CitizenReport from '../components/CitizenReport';
import { ArrowLeft, Building, MapPin, Calendar, CheckCircle, AlertTriangle, ShieldCheck, User, Share2, Download } from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet default icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*, contractors(company_name, blacklisted)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <AlertTriangle size={48} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Project Not Found</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <Link to="/" className="text-green-700 hover:text-green-800 font-medium flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
    </div>
  );

  const statusColors = {
    ACTIVE: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    ABANDONED: 'bg-red-100 text-red-800 border-red-200',
    PROTECTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const statusColor = statusColors[project.status] || 'bg-gray-100 text-gray-800 border-gray-200';
  const hasCoordinates = project.latitude && project.longitude;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-gray-600 hover:text-green-700 font-medium flex items-center gap-2 transition-colors text-sm sm:text-base">
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to Map</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-600" size={24} />
            <span className="font-bold text-gray-800 hidden sm:inline">INGEC Public Record</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
        <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden mb-8 ${project.status === 'ABANDONED' ? 'border-red-300' : 'border-gray-100'}`}>

          {/* Abandonment Alert Banner (#2) */}
          {project.status === 'ABANDONED' && (
             <div className="bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider text-center py-2 flex items-center justify-center gap-2">
                <AlertTriangle size={18} className="animate-pulse" />
                Abandonment Alert: This project has been flagged for investigation
             </div>
          )}

          {/* Header Area */}
          <div className={`${project.status === 'ABANDONED' ? 'bg-red-900' : 'bg-green-800'} p-6 sm:p-8 text-white relative transition-colors`}>
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Building size={120} />
             </div>
             <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-sm font-black uppercase tracking-wide border shadow-sm ${statusColor}`}>
                    {project.status}
                  </span>
                  <span className="bg-white/20 text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm border border-white/20 shadow-sm">
                    {project.sector} Sector
                  </span>

                  {/* Action Buttons (#14) */}
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Copied link!'); }} className="ml-auto flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors border border-white/10 backdrop-blur-md shadow-sm">
                    <Share2 size={14} /> Share
                  </button>
                  <button onClick={() => alert(`Downloading public report for ${project.project_name}...`)} className="flex items-center gap-1.5 bg-white text-green-900 hover:bg-green-50 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm hidden sm:flex border border-transparent">
                    <Download size={14} /> Report
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">{project.project_name}</h1>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-green-50">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <MapPin size={16} /> {project.lga}, {project.state}
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <Building size={16} /> MDA: {project.mda}
                  </div>
                </div>
             </div>
          </div>

          {/* Key Metrics (#2) */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200 border-b border-gray-200 bg-gray-50">
            <div className="p-4 sm:p-6 text-center hover:bg-white transition-colors">
               <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Approved Budget</p>
               <p className="text-lg sm:text-2xl font-black text-gray-900">₦{(project.approved_budget / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-4 sm:p-6 text-center hover:bg-white transition-colors">
               <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Actual Spend</p>
               <p className="text-lg sm:text-2xl font-black text-gray-900">₦{(project.actual_spend / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-4 sm:p-6 text-center hover:bg-white transition-colors">
               <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Completion</p>
               <div className="flex flex-col items-center justify-center gap-1">
                 <div className="flex items-center gap-2">
                    <p className="text-lg sm:text-2xl font-black text-gray-900">{project.completion_pct}%</p>
                    {project.completion_pct >= 50 && <ShieldCheck size={20} className="text-yellow-500 hidden sm:block" title="Protected Status Triggered" />}
                 </div>
                 {/* Visual completion bar (#2) */}
                 <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 max-w-[80px]">
                   <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${project.completion_pct}%` }}></div>
                 </div>
               </div>
            </div>
            <div className="p-4 sm:p-6 text-center hover:bg-white transition-colors bg-red-50/30">
               <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Citizen Flags</p>
               <p className={`text-lg sm:text-2xl font-black ${project.citizen_flags > 0 ? 'text-red-600' : 'text-green-600'}`}>
                 {project.citizen_flags}
               </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-4 sm:p-8 grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                  <User size={18} className="text-green-600" /> Contract Details
                </h3>
                <dl className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-3">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-500">Contractor</dt>
                    <dd className="col-span-2 text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1">
                      {project.contractors?.blacklisted ? <AlertTriangle size={14} className="text-red-500"/> : ''}
                      {project.contractor || project.contractors?.company_name}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-500">Administration</dt>
                    {/* Administration Tag (#2) */}
                    <dd className="col-span-2 text-xs sm:text-sm text-gray-900 font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded inline-block w-max border border-blue-100">{project.administration} Administration</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-500">Blockchain Hash</dt>
                    <dd className="col-span-2 text-[10px] sm:text-xs font-mono text-gray-600 break-all bg-gray-100 p-2 rounded border border-gray-200 shadow-inner">
                       {project.blockchain_hash || 'Pending Immutability Log...'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-green-600" /> Timeline
                </h3>
                <dl className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-3">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-500">Start Date</dt>
                    <dd className="col-span-2 text-xs sm:text-sm font-medium text-gray-900">{new Date(project.start_date).toLocaleDateString()}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-500">Target Date</dt>
                    <dd className="col-span-2 text-xs sm:text-sm font-medium text-gray-900">{project.target_date ? new Date(project.target_date).toLocaleDateString() : 'N/A'}</dd>
                  </div>
                  {project.actual_end_date && (
                    <div className="grid grid-cols-3">
                      <dt className="text-xs sm:text-sm font-semibold text-gray-500">Completion Date</dt>
                      <dd className="col-span-2 text-xs sm:text-sm text-green-700 font-bold flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded w-max border border-green-200">
                        {new Date(project.actual_end_date).toLocaleDateString()}
                        <CheckCircle size={14} className="text-green-600" />
                      </dd>
                    </div>
                  )}
                  <div className="grid grid-cols-3">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-500">Last Updated</dt>
                    <dd className="col-span-2 text-xs sm:text-sm text-gray-500 italic">{new Date(project.last_updated).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              {/* Localized Map Pin (#2) */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-green-600" /> Geolocation
                </h3>
                <div className="h-64 rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0 relative">
                  {hasCoordinates ? (
                    <MapContainer
                      center={[project.latitude, project.longitude]}
                      zoom={14}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[project.latitude, project.longitude]}
                        icon={STATUS_ICONS[project.status] || STATUS_ICONS.ACTIVE}
                      >
                        <Popup>{project.project_name}</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 text-center">
                       <MapPin size={32} className="mb-2 opacity-50" />
                       <p className="text-sm font-medium">No precise coordinates registered for this project.</p>
                       <p className="text-xs mt-1">General Location: {project.lga}, {project.state}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reporting Section (#3) */}
            <div className="bg-red-50/50 rounded-xl p-1 border border-red-200 shadow-sm h-full">
               <CitizenReport projectId={project.id} projectName={project.project_name} currentFlags={project.citizen_flags} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
