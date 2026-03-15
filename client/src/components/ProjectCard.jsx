import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const statusColors = {
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    ABANDONED: 'bg-red-100 text-red-800',
    PROTECTED: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
  };

  const statusColor = statusColors[project.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col h-full hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-xl text-gray-900 leading-tight line-clamp-2">{project.project_name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${statusColor}`}>
          {project.status}
        </span>
      </div>

      <div className="space-y-2 mb-6 flex-grow">
        <p className="text-sm text-gray-600"><span className="font-medium">Sector:</span> {project.sector}</p>
        <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {project.lga}, {project.state}</p>
        <p className="text-sm text-gray-600"><span className="font-medium">Contractor:</span> {project.contractor || (project.contractors?.company_name) || 'N/A'}</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">Completion</span>
            <span className="font-bold">{project.completion_pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, project.completion_pct))}%` }}
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-900 mt-2"><span className="font-medium">Budget:</span> ₦{project.approved_budget?.toLocaleString()}</p>
      </div>

      <Link
        to={`/projects/${project.id}`}
        className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 border border-gray-200 rounded transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}
