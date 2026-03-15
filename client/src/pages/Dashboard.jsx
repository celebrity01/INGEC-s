import { API_URL } from '../lib/api';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import INGECMap from '../components/INGECMap';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter, RefreshCw, ChartColumn, Users, Building, ShieldCheck, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ state: '', sector: '', status: '' });
  const [stats, setStats] = useState({ totalBudget: 0, avgCompletion: 0, activeProjects: 0, totalProjects: 0 });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      let data = [];

      if (searchTerm.trim() !== '') {
        const response = await fetch(`${API_URL}/projects/search?searchTerm=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Failed to search');
        data = await response.json();
      } else {
        const queryParams = new URLSearchParams();
        if (filters.state) queryParams.append('state', filters.state);
        if (filters.sector) queryParams.append('sector', filters.sector);
        if (filters.status) queryParams.append('status', filters.status);

        const response = await fetch(`${API_URL}/projects?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        data = await response.json();
      }

      setProjects(data);

      // Calculate stats
      const totalBudget = data.reduce((sum, p) => sum + (Number(p.approved_budget) || 0), 0);
      const avgCompletion = data.length > 0 ? data.reduce((sum, p) => sum + (Number(p.completion_pct) || 0), 0) / data.length : 0;
      const activeProjects = data.filter(p => p.status === 'ACTIVE').length;

      setStats({
        totalBudget,
        avgCompletion,
        activeProjects,
        totalProjects: data.length
      });

    } catch (err) {
      console.error(err);
      setError("Unable to load project data. Please try again.");

      // Fallback to Supabase client if backend fails
      try {
        let query = supabase.from('projects').select('*, contractors(company_name, blacklisted)').order('created_at', { ascending: false });
        if (filters.state) query = query.eq('state', filters.state);
        if (filters.sector) query = query.eq('sector', filters.sector);
        if (filters.status) query = query.eq('status', filters.status);
        if (searchTerm) query = query.or(`project_name.ilike.%${searchTerm}%,lga.ilike.%${searchTerm}%,contractor.ilike.%${searchTerm}%`);

        const { data, error: sbError } = await query;
        if (sbError) throw sbError;
        setProjects(data || []);
      } catch (e2) {
          console.error("Supabase fallback failed:", e2);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Subscribe to realtime changes (Section 5.4)
    const channel = supabase.channel('ingec_live')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setProjects(prev => prev.map(p =>
                p.id === payload.new.id ? { ...p, ...payload.new } : p
              ));
            } else if (payload.eventType === 'INSERT') {
                setProjects(prev => [payload.new, ...prev]);
            }
          })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [filters]); // Refetch when filters change. Excluded searchTerm intentionally to let users trigger search via button

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-md border-b-4 border-yellow-400">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-white p-1 rounded-full text-green-700">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">INGEC Platform</h1>
              <p className="text-xs text-green-100 font-medium">Integration & Evaluation Dashboard</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 text-sm font-medium">
             <div className="bg-green-800 rounded-lg px-4 py-2 flex items-center gap-2 border border-green-600 shadow-inner">
               <ChartColumn size={18} className="text-yellow-400"/>
               <div>
                  <span className="block text-xs text-green-200">Total Budget Tracked</span>
                  <span className="text-lg font-bold">₦{(stats.totalBudget / 1000000000).toFixed(2)}B</span>
               </div>
             </div>
             <div className="bg-green-800 rounded-lg px-4 py-2 flex items-center gap-2 border border-green-600 shadow-inner">
               <Building size={18} className="text-yellow-400"/>
               <div>
                  <span className="block text-xs text-green-200">Total Projects</span>
                  <span className="text-lg font-bold">{stats.totalProjects}</span>
               </div>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center border border-gray-100">
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-1/3">
            <input
              type="text"
              placeholder="Search projects, LGAs, contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </form>

          <div className="flex w-full lg:w-auto gap-3 items-center">
            <Filter size={18} className="text-gray-500 hidden sm:block" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:flex-none"
              value={filters.sector}
              onChange={(e) => setFilters({...filters, sector: e.target.value})}
            >
              <option value="">All Sectors</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Energy">Energy</option>
              <option value="Water">Water</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:flex-none"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ABANDONED">Abandoned</option>
              <option value="PROTECTED">Protected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <button
              onClick={() => {setSearchTerm(''); setFilters({state:'', sector:'', status:''});}}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
              title="Reset Filters"
            >
              <RefreshCw size={16} /> <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 text-red-700 flex items-center gap-3 rounded-r-lg">
             <ShieldCheck size={20} className="shrink-0" />
             <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="xl:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <MapPin className="text-green-600" />
                Live Project Tracker
              </h2>
              <span className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                LIVE SYNC
              </span>
            </div>
            <div className="flex-grow overflow-hidden rounded-lg border border-gray-200 shadow-inner">
               <INGECMap projects={projects} />
            </div>
          </div>

          {/* Project List Section */}
          <div className="flex flex-col bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Building className="text-green-600" />
                  Project Directory
                </h2>
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{projects.length} Results</span>
             </div>

            {loading ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
            ) : projects.length === 0 ? (
               <div className="flex-1 flex flex-col justify-center items-center py-20 text-gray-500 text-center">
                  <Search size={48} className="mb-4 text-gray-300" />
                  <p className="font-medium text-lg">No projects found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search term</p>
               </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-4" style={{ maxHeight: '600px' }}>
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
