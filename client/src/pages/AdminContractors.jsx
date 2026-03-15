import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, AlertTriangle, ShieldCheck, Plus, RefreshCw, Slash } from 'lucide-react';

export default function AdminContractors() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContractor, setNewContractor] = useState({ company_name: '', rc_number: '' });

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .order('company_name', { ascending: true });

    if (!error && data) {
      setContractors(data);
    }
    setLoading(false);
  };

  const toggleBlacklist = async (id, currentStatus) => {
    const reason = currentStatus ? null : window.prompt("Reason for blacklisting this contractor?");
    if (!currentStatus && reason === null) return; // User cancelled prompt

    const { error } = await supabase
      .from('contractors')
      .update({
         blacklisted: !currentStatus,
         blacklist_reason: reason,
         blacklist_date: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (!error) {
       fetchContractors();
    } else {
       alert("Failed to update blacklist status");
    }
  };

  const addContractor = async (e) => {
     e.preventDefault();
     const { data, error } = await supabase.from('contractors').insert([{ ...newContractor }]);
     if (error) alert(error.message);
     else {
        setNewContractor({ company_name: '', rc_number: '' });
        setShowAddForm(false);
        fetchContractors();
     }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Users className="text-green-600" /> Contractor Registry
           </h1>
           <p className="text-gray-500 text-sm mt-1">Manage vendor blacklist status to enforce accountability.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-bold transition-colors">
              <Plus size={18} /> New Contractor
           </button>
           <button onClick={fetchContractors} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Refresh Registry">
             <RefreshCw size={20} className="text-gray-600" />
           </button>
        </div>
      </div>

      {showAddForm && (
         <div className="bg-gray-50 p-4 border border-green-200 rounded-lg mb-6 shadow-inner">
            <h3 className="font-bold mb-3 flex items-center gap-1">Add to Registry</h3>
            <form className="flex flex-col md:flex-row gap-4" onSubmit={addContractor}>
               <input type="text" placeholder="Company Name *" required value={newContractor.company_name} onChange={(e) => setNewContractor({...newContractor, company_name: e.target.value})} className="flex-1 border p-2 rounded focus:ring-green-500" />
               <input type="text" placeholder="RC Number" value={newContractor.rc_number} onChange={(e) => setNewContractor({...newContractor, rc_number: e.target.value})} className="flex-1 border p-2 rounded focus:ring-green-500" />
               <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded">Save</button>
            </form>
         </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RC Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Record</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blacklist Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading contractors...</td></tr>
            ) : contractors.length === 0 ? (
               <tr><td colSpan="5" className="text-center py-8 text-gray-500">No contractors registered yet.</td></tr>
            ) : contractors.map((contractor) => (
              <tr key={contractor.id} className={`hover:bg-gray-50 transition-colors ${contractor.blacklisted ? 'bg-red-50/30' : ''}`}>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                     {contractor.blacklisted ? <Slash size={16} className="text-red-500" /> : <ShieldCheck size={16} className="text-green-500" />}
                     {contractor.company_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {contractor.rc_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Contracts: <span className="font-bold">{contractor.total_contracts}</span></div>
                  <div>Avg Completion: <span className="font-bold">{contractor.avg_completion}%</span></div>
                </td>
                <td className="px-6 py-4">
                   {contractor.blacklisted ? (
                      <div>
                         <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800 border border-red-200 mb-1">
                           BLACKLISTED
                         </span>
                         <p className="text-xs text-red-600 truncate max-w-[200px]" title={contractor.blacklist_reason}>
                           Reason: {contractor.blacklist_reason}
                         </p>
                      </div>
                   ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 border border-green-200">
                        CLEARED
                      </span>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                     onClick={() => toggleBlacklist(contractor.id, contractor.blacklisted)}
                     className={`px-3 py-1 rounded font-bold border transition-colors ${
                        contractor.blacklisted
                           ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                           : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                     }`}
                  >
                     {contractor.blacklisted ? 'Pardon / Unblacklist' : 'Blacklist Vendor'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
