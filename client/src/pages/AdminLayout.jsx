import { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, LogOut, ShieldCheck, MapPin, AlertTriangle, Users } from 'lucide-react';

export default function AdminLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div></div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <nav className="bg-green-800 text-white w-full md:w-64 md:min-h-screen p-4 flex flex-col">
        <div className="flex items-center gap-2 font-bold text-xl mb-8 pb-4 border-b border-green-700">
          <ShieldCheck /> INGEC Admin
        </div>
        <div className="flex-grow space-y-2">
          <Link to="/admin" className="flex items-center gap-3 p-3 rounded hover:bg-green-700 transition">
            <LayoutDashboard size={20} /> Projects Dashboard
          </Link>
          <Link to="/admin/register" className="flex items-center gap-3 p-3 rounded hover:bg-green-700 transition">
            <MapPin size={20} /> Register Project
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-3 p-3 rounded hover:bg-green-700 transition">
            <AlertTriangle size={20} /> Citizen Reports
          </Link>
          <Link to="/admin/contractors" className="flex items-center gap-3 p-3 rounded hover:bg-green-700 transition">
            <Users size={20} /> Contractors
          </Link>
        </div>
        <div className="mt-auto pt-4 border-t border-green-700">
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 p-3 text-red-300 hover:bg-green-700 hover:text-white rounded transition">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
