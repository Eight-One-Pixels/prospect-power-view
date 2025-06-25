
import { Navigation } from "@/components/Navigation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            System Administration
          </h1>
          <p className="text-lg text-gray-600">
            Monitor organization-wide performance and manage system settings
          </p>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
};

export default Admin;
