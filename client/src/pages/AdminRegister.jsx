import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { geocodeLGA } from '../lib/geocode';
import { Save, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function AdminRegister() {
  const [contractors, setContractors] = useState([]);
  const [formData, setFormData] = useState({
    project_name: '', sector: '', mda: '', state: '', lga: '',
    contractor_id: '', approved_budget: '', actual_spend: 0, completion_pct: 0,
    administration: '', start_date: '', target_date: '', status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
     fetchContractors();
  }, []);

  const fetchContractors = async () => {
     const { data, error } = await supabase.from('contractors').select('*').order('company_name');
     if (!error) setContractors(data);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.contractor_id) {
       setMessage({ type: 'error', text: 'Please select a registered contractor.' });
       setLoading(false);
       return;
    }

    try {
      // 1. Geocode LGA and State to get Lat/Lng automatically
      const { latitude, longitude } = await geocodeLGA(formData.lga, formData.state);

      if (!latitude || !longitude) {
         if (!window.confirm("Warning: Could not automatically find coordinates for this LGA. Do you want to register the project without a map pin?")) {
            setLoading(false);
            return;
         }
      }

      // 2. Fetch contractor name to keep denormalized column populated as requested
      const selectedContractor = contractors.find(c => c.id === formData.contractor_id);

      // 3. Insert into Supabase (requires authenticated staff role)
      const { error } = await supabase.from('projects').insert([{
        ...formData,
        contractor: selectedContractor.company_name, // Important: set denormalized column AND relational column
        approved_budget: Number(formData.approved_budget),
        actual_spend: Number(formData.actual_spend),
        completion_pct: Number(formData.completion_pct),
        latitude,
        longitude
      }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Project registered successfully! Coordinates auto-mapped.' });
      setFormData({
         project_name: '', sector: '', mda: '', state: '', lga: '',
         contractor_id: '', approved_budget: '', actual_spend: 0, completion_pct: 0,
         administration: '', start_date: '', target_date: '', status: 'ACTIVE'
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to register project.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Register New Project</h1>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>
          {message.type === 'success' ? <CheckCircle className="shrink-0 mt-0.5" size={18} /> : <AlertTriangle className="shrink-0 mt-0.5" size={18} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input type="text" name="project_name" required value={formData.project_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
            <select name="sector" required value={formData.sector} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500">
              <option value="">Select Sector</option>
              {['Infrastructure','Health','Education','Energy','Water','Digital','Housing','Agriculture','Security','Social'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MDA (Ministry/Dept/Agency) *</label>
            <input type="text" name="mda" required value={formData.mda} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LGA (For Auto-mapping) *</label>
            <input type="text" name="lga" required value={formData.lga} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
               Contractor *
               <button type="button" onClick={fetchContractors} className="text-gray-400 hover:text-green-600"><RefreshCw size={14}/></button>
            </label>
            <select name="contractor_id" required value={formData.contractor_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500">
               <option value="">-- Select Registered Contractor --</option>
               {contractors.map(c => (
                  <option key={c.id} value={c.id}>
                     {c.company_name} {c.blacklisted ? '(BLACKLISTED)' : ''}
                  </option>
               ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1">If the contractor is missing, register them in the Contractors panel first.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Administration (e.g. Tinubu, Buhari) *</label>
            <input type="text" name="administration" required value={formData.administration} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approved Budget (₦) *</label>
            <input type="number" name="approved_budget" required min="0" value={formData.approved_budget} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Spend So Far (₦)</label>
            <input type="number" name="actual_spend" min="0" value={formData.actual_spend} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input type="date" name="start_date" required value={formData.start_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500">
               <option value="ACTIVE">ACTIVE</option>
               <option value="COMPLETED">COMPLETED</option>
               <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Completion %</label>
             <input type="number" name="completion_pct" min="0" max="100" value={formData.completion_pct} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button type="submit" disabled={loading} className="w-full md:w-auto px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={20} /> {loading ? 'Saving Project...' : 'Register Project & Auto-map'}
          </button>
        </div>
      </form>
    </div>
  );
}
