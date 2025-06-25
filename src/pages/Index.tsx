
import { Navigation } from "@/components/Navigation";
import { RepDashboard } from "@/components/dashboard/RepDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isManager = userRole === 'manager';
  const isAdminOrDirector = userRole && ['admin', 'director'].includes(userRole);

  const getDashboardTitle = () => {
    if (isAdminOrDirector) return 'Admin Dashboard';
    if (isManager) return 'Personal Dashboard';
    return 'Sales Dashboard';
  };

  const getDashboardDescription = () => {
    if (isAdminOrDirector) return 'Monitor organization performance and manage system settings';
    if (isManager) return 'Track your personal visits, leads, and sales performance';
    return 'Track your visits, leads, and sales performance';
  };

  const getDashboardComponent = () => {
    if (isAdminOrDirector) return <AdminDashboard />;
    if (isManager) return <RepDashboard />;
    return <RepDashboard />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {getDashboardTitle()}
          </h1>
          <p className="text-lg text-gray-600">
            {getDashboardDescription()}
          </p>
        </div>

        {getDashboardComponent()}
      </div>
    </div>
  );
};

export default Index;
