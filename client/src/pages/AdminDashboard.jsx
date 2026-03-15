import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, MapPin, Building, Activity, Save, X, Edit2 } from 'lucide-react';

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ completion_pct: '', actual_spend: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, contractors(company_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(id);
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus, last_updated: new Date() })
      .eq('id', id);

    if (!error) {
      setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } else {
      alert("Failed to update status");
    }
    setUpdating(null);
  };

  const startEdit = (project) => {
    setEditingProject(project.id);
    setEditForm({ completion_pct: project.completion_pct, actual_spend: project.actual_spend });
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setEditForm({ completion_pct: '', actual_spend: '' });
  };

  const saveEdit = async (id) => {
    setUpdating(id);
    const { error } = await supabase
      .from('projects')
      .update({
        completion_pct: Number(editForm.completion_pct),
        actual_spend: Number(editForm.actual_spend),
        last_updated: new Date()
      })
      .eq('id', id);

    if (!error) {
      setProjects(projects.map(p => p.id === id ? { ...p, completion_pct: Number(editForm.completion_pct), actual_spend: Number(editForm.actual_spend) } : p));
      cancelEdit();
    } else {
      alert("Failed to update project metrics");
    }
    setUpdating(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
           <p className="text-sm text-gray-500">Update quarterly metrics and project statuses.</p>
        </div>
        <button onClick={fetchProjects} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <RefreshCw size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector/Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent (₦)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8">Loading projects...</td></tr>
            ) : projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 line-clamp-2">{project.project_name}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {project.lga}, {project.state}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {project.sector}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Building size={14}/> {project.contractor || project.contractors?.company_name || 'N/A'}</div>
                </td>

                {/* Editable Spend */}
                <td className="px-6 py-4 whitespace-nowrap">
                   {editingProject === project.id ? (
                      <input
                         type="number"
                         className="w-full border p-1 rounded text-sm"
                         value={editForm.actual_spend}
                         onChange={(e) => setEditForm({...editForm, actual_spend: e.target.value})}
                      />
                   ) : (
                      <div>
                        <div className="text-xs text-gray-500">B: {(project.approved_budget / 1000000).toFixed(1)}M</div>
                        <div className="text-sm text-gray-900 font-bold">S: {(project.actual_spend / 1000000).toFixed(1)}M</div>
                      </div>
                   )}
                </td>

                {/* Editable Completion */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {editingProject === project.id ? (
                      <input
                         type="number"
                         min="0" max="100"
                         className="w-16 border p-1 rounded text-sm"
                         value={editForm.completion_pct}
                         onChange={(e) => setEditForm({...editForm, completion_pct: e.target.value})}
                      />
                   ) : (
                      <div className="flex items-center gap-2">
                        <Activity size={14} className={project.completion_pct >= 50 ? 'text-green-500' : 'text-orange-500'} />
                        <span className="font-bold text-gray-900">{project.completion_pct}%</span>
                      </div>
                   )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={project.status}
                    onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                    disabled={updating === project.id}
                    className={`text-xs font-bold rounded-full px-3 py-1 outline-none border cursor-pointer
                      ${project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        project.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' :
                        project.status === 'ABANDONED' ? 'bg-red-100 text-red-800 border-red-200' :
                        project.status === 'PROTECTED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-orange-100 text-orange-800 border-orange-200'}`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ABANDONED">ABANDONED</option>
                    <option value="PROTECTED">PROTECTED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {updating === project.id ? (
                     <span className="text-gray-400">Saving...</span>
                  ) : editingProject === project.id ? (
                     <div className="flex gap-2">
                        <button onClick={() => saveEdit(project.id)} className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded" title="Save">
                           <Save size={16} />
                        </button>
                        <button onClick={cancelEdit} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded" title="Cancel">
                           <X size={16} />
                        </button>
                     </div>
                  ) : (
                    <button onClick={() => startEdit(project)} className="text-indigo-600 hover:text-indigo-900 font-medium bg-indigo-50 px-3 py-1 rounded flex items-center gap-1">
                       <Edit2 size={14} /> Update
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
