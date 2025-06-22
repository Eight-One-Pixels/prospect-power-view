
import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsOverview } from "@/components/StatsOverview";
import { LeadsTable } from "@/components/LeadsTable";
import { SalesChart } from "@/components/SalesChart";
import { TeamPerformance } from "@/components/TeamPerformance";
import { FilterPanel } from "@/components/FilterPanel";

const Index = () => {
  const [filters, setFilters] = useState({
    dateRange: "30",
    leadSource: "all",
    status: "all",
    assignee: "all"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        <DashboardHeader />
        
        <div className="mb-8">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>

        <div className="mb-8">
          <StatsOverview filters={filters} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          <div className="xl:col-span-2">
            <SalesChart filters={filters} />
          </div>
          <div>
            <TeamPerformance filters={filters} />
          </div>
        </div>

        <div>
          <LeadsTable filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default Index;
