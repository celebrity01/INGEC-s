import { Link } from 'react-router-dom';
import { Share2, AlertTriangle, Download } from 'lucide-react';

export default function ProjectCard({ project }) {
  const statusColors = {
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    ABANDONED: 'bg-red-100 text-red-800',
    PROTECTED: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
  };

  const statusColor = statusColors[project.status] || 'bg-gray-100 text-gray-800';

  const handleShare = (e) => {
    e.preventDefault();
    const url = `${window.location.origin}/projects/${project.id}`;
    navigator.clipboard.writeText(url);
    alert('Project link copied to clipboard!');
  };

  const handleDownload = (e) => {
    e.preventDefault();
    // Simulate report generation
    alert(`Downloading public report for ${project.project_name}...`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 sm:p-5 border flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden ${project.status === 'ABANDONED' ? 'border-red-300' : 'border-gray-200'}`}>

      {/* Abandonment Alert Banner (#1, #2) */}
      {project.status === 'ABANDONED' && (
         <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider text-center py-0.5 flex items-center justify-center gap-1">
            <AlertTriangle size={10} /> Abandonment Alert
         </div>
      )}

      <div className={`flex justify-between items-start mb-3 ${project.status === 'ABANDONED' ? 'mt-3' : ''}`}>
        <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight line-clamp-2 pr-2">{project.project_name}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide whitespace-nowrap shrink-0 border border-white/20 shadow-sm ${statusColor}`}>
          {project.status}
        </span>
      </div>

      <div className="space-y-1.5 mb-4 flex-grow">
        <p className="text-xs text-gray-600"><span className="font-semibold">Sector:</span> {project.sector}</p>
        <p className="text-xs text-gray-600"><span className="font-semibold">Location:</span> {project.lga}, {project.state}</p>
        <p className="text-xs text-gray-600 truncate"><span className="font-semibold">Contractor:</span> {project.contractor || (project.contractors?.company_name) || 'N/A'}</p>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">Completion</span>
            <span className="font-black">{project.completion_pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${project.status === 'ABANDONED' ? 'bg-red-500' : 'bg-green-600'}`}
              style={{ width: `${Math.min(100, Math.max(0, project.completion_pct))}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 text-xs text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
           <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Budget</span>
           <span className="font-bold text-sm">₦{(project.approved_budget / 1000000).toFixed(1)}M</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="flex-1 text-center bg-gray-50 hover:bg-green-50 text-green-800 font-bold py-2 px-3 border border-gray-200 rounded text-xs transition-colors shadow-sm"
        >
          View Details
        </Link>
        {/* Share and Download Buttons (#14) */}
        <button onClick={handleShare} className="p-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors" title="Copy Link">
           <Share2 size={16} />
        </button>
        <button onClick={handleDownload} className="p-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors hidden sm:block" title="Download Public Report">
           <Download size={16} />
        </button>
      </div>
    </div>
  );
}
