import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { API_URL } from '../lib/api';
import INGECMap from '../components/INGECMap';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter, RefreshCw, ChartColumn, Users, Building, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ state: '', sector: '', status: '' });
  const [stats, setStats] = useState({ totalBudget: 0, avgCompletion: 0, activeProjects: 0, totalProjects: 0, abandonedCount: 0, administrations: 0 });

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

      // Calculate extended stats for the National Statistics Widget (#10)
      const totalBudget = data.reduce((sum, p) => sum + (Number(p.approved_budget) || 0), 0);
      const avgCompletion = data.length > 0 ? data.reduce((sum, p) => sum + (Number(p.completion_pct) || 0), 0) / data.length : 0;
      const activeProjects = data.filter(p => p.status === 'ACTIVE').length;
      const abandonedCount = data.filter(p => p.status === 'ABANDONED').length;

      // Count unique administrations
      const adminSet = new Set(data.map(p => p.administration).filter(Boolean));

      setStats({
        totalBudget,
        avgCompletion,
        activeProjects,
        totalProjects: data.length,
        abandonedCount,
        administrations: adminSet.size
      });

    } catch (err) {
      console.error(err);
      setError("Unable to load project data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

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

    return () => supabase.removeChannel(channel);
  }, [filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  // State mapping for filter
  const NIGERIA_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-green-700 text-white shadow-md border-b-4 border-yellow-400 relative z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col xl:flex-row justify-between xl:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full text-green-700">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">INGEC Platform</h1>
              <p className="text-xs text-green-100 font-medium">Integration & Evaluation Dashboard</p>
            </div>
          </div>

          {/* Extended Stats Bar (#1, #10) */}
          <div className="flex flex-wrap gap-2 sm:gap-4 text-sm font-medium w-full xl:w-auto">
             <div className="bg-green-800 rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 border border-green-600 flex-1 min-w-[120px]">
               <Building size={18} className="text-yellow-400 shrink-0"/>
               <div>
                  <span className="block text-[10px] sm:text-xs text-green-200 leading-tight">Total Projects</span>
                  <span className="text-base sm:text-lg font-bold">{stats.totalProjects}</span>
               </div>
             </div>
             <div className="bg-green-800 rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 border border-green-600 flex-1 min-w-[120px]">
               <ChartColumn size={18} className="text-yellow-400 shrink-0"/>
               <div>
                  <span className="block text-[10px] sm:text-xs text-green-200 leading-tight">Federal Spend</span>
                  <span className="text-base sm:text-lg font-bold">₦{(stats.totalBudget / 1000000000).toFixed(2)}B</span>
               </div>
             </div>
             <div className="bg-green-800 rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 border border-red-500/50 flex-1 min-w-[120px]">
               <AlertTriangle size={18} className="text-red-400 shrink-0"/>
               <div>
                  <span className="block text-[10px] sm:text-xs text-red-200 leading-tight">Abandoned</span>
                  <span className="text-base sm:text-lg font-bold text-red-300">{stats.abandonedCount}</span>
               </div>
             </div>
             <div className="bg-green-800 rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 border border-green-600 flex-1 min-w-[120px]">
               <Users size={18} className="text-yellow-400 shrink-0"/>
               <div>
                  <span className="block text-[10px] sm:text-xs text-green-200 leading-tight">Admins Tracked</span>
                  <span className="text-base sm:text-lg font-bold">{stats.administrations}</span>
               </div>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6">
        {/* Controls Section (#1, #11, #12) */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-6 flex flex-col lg:flex-row gap-3 justify-between items-center border border-gray-100 z-20 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-1/3">
            <input
              type="text"
              placeholder="Search by name, LGA, contractor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </form>

          <div className="flex flex-wrap w-full lg:w-auto gap-2 sm:gap-3 items-center">
            <Filter size={18} className="text-gray-500 hidden sm:block shrink-0" />
            <select
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-[100px]"
              value={filters.state}
              onChange={(e) => setFilters({...filters, state: e.target.value})}
            >
              <option value="">All States</option>
              {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-[100px]"
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
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-[100px]"
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
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-lg text-sm transition-colors flex justify-center items-center gap-1 w-full sm:w-auto mt-2 sm:mt-0"
              title="Reset Filters"
            >
              <RefreshCw size={16} /> <span className="sm:hidden lg:inline">Reset</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 flex items-center gap-3 rounded-r-lg">
             <ShieldCheck size={20} className="shrink-0" />
             <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
          {/* Map Section */}
          <div className="xl:col-span-2 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col relative z-0">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-800">
                <MapPin className="text-green-600" />
                Live Project Tracker
              </h2>
              <span className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                LIVE SYNC
              </span>
            </div>

            {/* Map Legend (#13) */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 text-[10px] sm:text-xs font-bold text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div> Active</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div> Completed</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div> Abandoned</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div> Protected</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div> Suspended</div>
            </div>

            <div className="flex-grow overflow-hidden rounded-lg border border-gray-200 shadow-inner min-h-[400px] sm:min-h-[500px]">
               {/* Pass filtered projects to map (#12) */}
               <INGECMap projects={projects} />
            </div>
          </div>

          {/* Project List Section */}
          <div className="flex flex-col bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 h-full">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Building className="text-green-600" />
                  Project Directory
                </h2>
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{projects.length} Results</span>
             </div>

            {loading ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
              </div>
            ) : projects.length === 0 ? (
               <div className="flex-1 flex flex-col justify-center items-center py-20 text-gray-500 text-center">
                  <Search size={40} className="mb-4 text-gray-300" />
                  <p className="font-medium text-base">No projects found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search term</p>
               </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 max-h-[500px] xl:max-h-[650px] scrollbar-thin scrollbar-thumb-gray-300">
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
