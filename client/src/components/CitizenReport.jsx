import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { API_URL } from '../lib/api';
import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export default function CitizenReport({ projectId, projectName, currentFlags = 0 }) {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    lga: '',
    evidenceUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '', refId: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateRef = () => {
     return 'REP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.description) {
      setStatus({ type: 'error', message: 'Report type and description are required.', refId: '' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '', refId: '' });
    const refId = generateRef();

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          type: formData.type,
          description: formData.description,
          lga: formData.lga,
          evidenceUrl: formData.evidenceUrl
        }),
      });

      if (!response.ok) throw new Error('Failed to submit report via API');

      // Removed insecure optimistic RPC call: the database trigger will handle the increment securely.

      setStatus({ type: 'success', message: 'Report securely logged.', refId });
      setFormData({ type: '', description: '', lga: '', evidenceUrl: '' });
    } catch (error) {
      console.error('Report Error:', error);
      // Fallback to Supabase client if API fails
      try {
        const { error: sbError } = await supabase.from('citizen_reports').insert({
            project_id: projectId,
            report_type: formData.type,
            description: formData.description,
            reporter_lga: formData.lga,
            evidence_url: formData.evidenceUrl
        });
        if (sbError) throw sbError;
        setStatus({ type: 'success', message: 'Report securely logged.', refId });
        setFormData({ type: '', description: '', lga: '', evidenceUrl: '' });
      } catch (err2) {
         setStatus({ type: 'error', message: 'An error occurred while submitting your report. Please try again.', refId: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-100 p-4 sm:p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
         <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-red-700">
           <AlertTriangle size={20} />
           Flag an Issue
         </h3>
         <div className="bg-red-50 text-red-800 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full border border-red-200">
            {currentFlags} Reports Filed
         </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-6">
        Have you noticed discrepancies with <strong>{projectName}</strong>? Your report helps ensure accountability.
      </p>

      {status.message && (
        <div className={`p-4 rounded-lg mb-6 flex flex-col items-start gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200 shadow-inner' : 'bg-red-50 text-red-800 border border-red-200 shadow-inner'}`}>
          <div className="flex items-center gap-2">
             {status.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
             <p className="text-sm font-bold">{status.message}</p>
          </div>
          {status.refId && (
             <div className="mt-2 w-full bg-white p-2 rounded border border-green-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 flex items-center gap-1"><FileText size={14}/> Reference No:</span>
                <span className="font-mono font-black text-gray-800">{status.refId}</span>
             </div>
          )}
        </div>
      )}

      {status.type !== 'success' && (
         <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
           <div>
             <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Issue Type *</label>
             <select
               name="type"
               value={formData.type}
               onChange={handleChange}
               className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-inner"
               required
               disabled={isSubmitting}
             >
               <option value="">Select an issue type</option>
               <option value="GHOST_PROJECT">Ghost Project (Does not exist)</option>
               <option value="ABANDONED">Abandoned</option>
               <option value="OVERPRICED">Overpriced / Poor Quality</option>
               <option value="WRONG_LOCATION">Wrong Location</option>
               <option value="OTHER">Other</option>
             </select>
           </div>

           <div className="flex-grow">
             <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Description *</label>
             <textarea
               name="description"
               value={formData.description}
               onChange={handleChange}
               rows="4"
               placeholder="Please provide specific details..."
               className="w-full h-full min-h-[100px] border border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none text-sm shadow-inner"
               required
               disabled={isSubmitting}
             ></textarea>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-1">Your LGA (Optional)</label>
               <input
                 type="text"
                 name="lga"
                 value={formData.lga}
                 onChange={handleChange}
                 placeholder="e.g. Kano Municipal"
                 className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-inner"
                 disabled={isSubmitting}
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-1">Evidence URL (Optional)</label>
               <input
                 type="url"
                 name="evidenceUrl"
                 value={formData.evidenceUrl}
                 onChange={handleChange}
                 placeholder="Link to photos/video"
                 className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm shadow-inner"
                 disabled={isSubmitting}
               />
             </div>
           </div>

           <button
             type="submit"
             disabled={isSubmitting}
             className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-black uppercase tracking-wider text-sm py-3 px-4 rounded-lg transition-colors mt-auto flex justify-center items-center gap-2 shadow-sm border border-red-800"
           >
             {isSubmitting ? 'Submitting...' : 'Submit Report Anonymously'}
           </button>
         </form>
      )}
    </div>
  );
}
