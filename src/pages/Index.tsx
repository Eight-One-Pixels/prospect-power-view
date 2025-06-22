
import { Navigation } from "@/components/Navigation";
import { RepDashboard } from "@/components/dashboard/RepDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
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

  const isManager = userRole && ['manager', 'director', 'admin'].includes(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isManager ? 'Management Dashboard' : 'Sales Dashboard'}
          </h1>
          <p className="text-lg text-gray-600">
            {isManager 
              ? 'Monitor team performance and manage your sales organization' 
              : 'Track your visits, leads, and sales performance'
            }
          </p>
        </div>

        {isManager ? <ManagerDashboard /> : <RepDashboard />}
      </div>
    </div>
  );
};

export default Index;
