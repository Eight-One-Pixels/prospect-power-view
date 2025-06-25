
import { Navigation } from "@/components/Navigation";
import { ManageTeamDashboard } from "@/components/dashboard/ManageTeamDashboard";

const ManageTeam = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Team Management
          </h1>
          <p className="text-lg text-gray-600">
            Monitor your team's performance and manage team activities
          </p>
        </div>

        <ManageTeamDashboard />
      </div>
    </div>
  );
};

export default ManageTeam;
