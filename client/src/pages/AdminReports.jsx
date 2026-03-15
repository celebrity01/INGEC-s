import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, CheckCircle, AlertTriangle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('citizen_reports')
      .select('*, projects(project_name, state)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  };

  const markReviewed = async (id, currentStatus) => {
    const { error } = await supabase
      .from('citizen_reports')
      .update({ reviewed: !currentStatus })
      .eq('id', id);

    if (!error) {
       setReports(reports.map(r => r.id === id ? { ...r, reviewed: !currentStatus } : r));
    } else {
       alert("Failed to update status");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <AlertTriangle className="text-red-600" /> Citizen Reports Review Queue
           </h1>
           <p className="text-gray-500 text-sm mt-1">Review flagged anomalies submitted by the public.</p>
        </div>
        <button onClick={fetchReports} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" title="Refresh Queue">
          <RefreshCw size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-8 text-gray-500">Loading reports queue...</div>
        ) : reports.length === 0 ? (
           <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">No citizen reports found.</div>
        ) : reports.map((report) => (
           <div key={report.id} className={`p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-start ${report.reviewed ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-red-200 shadow-sm'}`}>
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <span className={`px-2 py-1 text-xs font-bold rounded ${report.reviewed ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-800'}`}>
                     {report.report_type.replace('_', ' ')}
                   </span>
                   <span className="text-xs text-gray-500">{new Date(report.created_at).toLocaleString()}</span>
                   {report.reporter_lga && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">LGA: {report.reporter_lga}</span>}
                </div>
                <p className="text-gray-800 text-sm mb-3 bg-gray-50 p-3 rounded border border-gray-100 italic">"{report.description}"</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                   <Link to={`/projects/${report.project_id}`} target="_blank" className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                      <LinkIcon size={14} /> Project: {report.projects?.project_name || 'Unknown'}
                   </Link>
                   {report.evidence_url && (
                      <a href={report.evidence_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                         <ExternalLink size={14} /> View Attached Evidence
                      </a>
                   )}
                </div>
             </div>
             <div className="md:ml-auto w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <button
                  onClick={() => markReviewed(report.id, report.reviewed)}
                  className={`w-full md:w-auto px-4 py-2 rounded font-semibold flex justify-center items-center gap-2 transition-colors border ${
                     report.reviewed
                       ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                       : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle size={16} />
                  {report.reviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed & Handled'}
                </button>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
