import { API_URL } from '../lib/api';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function CitizenReport({ projectId, projectName }) {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    lga: '',
    evidenceUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.description) {
      setStatus({ type: 'error', message: 'Report type and description are required.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

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

      setStatus({ type: 'success', message: 'Thank you. Your report has been submitted for review.' });
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
        setStatus({ type: 'success', message: 'Thank you. Your report has been submitted for review.' });
        setFormData({ type: '', description: '', lga: '', evidenceUrl: '' });
      } catch (err2) {
         setStatus({ type: 'error', message: 'An error occurred while submitting your report. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
      <h3 className="text-lg font-bold flex items-center gap-2 text-red-700 mb-4">
        <AlertTriangle size={20} />
        Flag an Issue
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Have you noticed discrepancies with <strong>{projectName}</strong>? Your report helps ensure accountability.
      </p>

      {status.message && (
        <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle className="shrink-0 mt-0.5" size={18} /> : <AlertTriangle className="shrink-0 mt-0.5" size={18} />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Please provide specific details..."
            className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your LGA (Optional)</label>
            <input
              type="text"
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              placeholder="e.g. Kano Municipal"
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evidence URL (Optional)</label>
            <input
              type="url"
              name="evidenceUrl"
              value={formData.evidenceUrl}
              onChange={handleChange}
              placeholder="Link to photos/video"
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 flex justify-center items-center gap-2"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report Anonymously'}
        </button>
      </form>
    </div>
  );
}
