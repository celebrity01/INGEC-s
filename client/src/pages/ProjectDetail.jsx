import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CitizenReport from '../components/CitizenReport';
import { ArrowLeft, Building, MapPin, Calendar, CheckCircle, AlertTriangle, ShieldCheck, User } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-gray-600 hover:text-green-700 font-medium flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-600" size={24} />
            <span className="font-bold text-gray-800 hidden sm:inline">INGEC Public Record</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Header Area */}
          <div className="bg-green-700 p-8 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Building size={120} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${statusColor}`}>
                    {project.status}
                  </span>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    {project.sector} Sector
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{project.project_name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-green-50">
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin size={18} /> {project.lga}, {project.state}
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Building size={18} /> MDA: {project.mda}
                  </div>
                </div>
             </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 border-b border-gray-100 bg-gray-50/50">
            <div className="p-6 text-center">
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Approved Budget</p>
               <p className="text-2xl font-black text-gray-900">₦{(project.approved_budget / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-6 text-center">
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Actual Spend</p>
               <p className="text-2xl font-black text-gray-900">₦{(project.actual_spend / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-6 text-center">
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Completion</p>
               <div className="flex items-center justify-center gap-2">
                 <p className="text-2xl font-black text-gray-900">{project.completion_pct}%</p>
                 {project.completion_pct >= 50 && <ShieldCheck size={20} className="text-yellow-500" title="Protected Status Triggered" />}
               </div>
            </div>
            <div className="p-6 text-center">
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Citizen Flags</p>
               <p className={`text-2xl font-black ${project.citizen_flags > 0 ? 'text-red-600' : 'text-green-600'}`}>
                 {project.citizen_flags}
               </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                  <User size={20} className="text-green-600" /> Contract Details
                </h3>
                <dl className="space-y-4">
                  <div className="grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Contractor</dt>
                    <dd className="col-span-2 text-sm font-semibold text-gray-900">{project.contractor}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Administration</dt>
                    <dd className="col-span-2 text-sm text-gray-900">{project.administration}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Blockchain Hash</dt>
                    <dd className="col-span-2 text-xs font-mono text-gray-500 break-all bg-gray-100 p-2 rounded">{project.blockchain_hash || 'Pending...'}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-green-600" /> Timeline
                </h3>
                <dl className="space-y-4">
                  <div className="grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="col-span-2 text-sm text-gray-900">{new Date(project.start_date).toLocaleDateString()}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Target Date</dt>
                    <dd className="col-span-2 text-sm text-gray-900">{project.target_date ? new Date(project.target_date).toLocaleDateString() : 'N/A'}</dd>
                  </div>
                  {project.actual_end_date && (
                    <div className="grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Completion Date</dt>
                      <dd className="col-span-2 text-sm text-gray-900 flex items-center gap-2">
                        {new Date(project.actual_end_date).toLocaleDateString()}
                        <CheckCircle size={14} className="text-green-500" />
                      </dd>
                    </div>
                  )}
                  <div className="grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="col-span-2 text-sm text-gray-500 italic">{new Date(project.last_updated).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Reporting Section */}
            <div className="bg-red-50/50 rounded-xl p-1 border border-red-100 h-full">
               <CitizenReport projectId={project.id} projectName={project.project_name} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
