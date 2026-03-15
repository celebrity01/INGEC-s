import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegister from './pages/AdminRegister';
import AdminReports from './pages/AdminReports';
import AdminContractors from './pages/AdminContractors';
import ProjectDetail from './pages/ProjectDetail';
import NkechiChat from './components/NkechiChat';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="register" element={<AdminRegister />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="contractors" element={<AdminContractors />} />
          </Route>
        </Routes>
        <NkechiChat />
      </div>
    </Router>
  );
}

export default App;
