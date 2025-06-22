
import { Calendar, Users, TrendingUp } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            CRM Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track leads, sales, and team performance across digital marketing and on-site operations
          </p>
        </div>
        
        <div className="flex items-center gap-6 mt-6 lg:mt-0">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Last updated: Just now</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">+12.5%</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">8 Active Reps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
