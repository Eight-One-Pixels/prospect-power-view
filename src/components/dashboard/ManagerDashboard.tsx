
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Target, DollarSign } from "lucide-react";

export const ManagerDashboard = () => {
  // Fetch team overview stats
  const { data: teamStats, isLoading } = useQuery({
    queryKey: ['team-stats'],
    queryFn: async () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Get all team members
      const { data: teamMembers } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `);

      // Get total visits this month
      const { count: totalVisits } = await supabase
        .from('daily_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', startOfMonth.toISOString().split('T')[0]);

      // Get total leads this month
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Get total conversions and revenue this month
      const { data: conversions } = await supabase
        .from('conversions')
        .select('revenue_amount')
        .gte('conversion_date', startOfMonth.toISOString().split('T')[0]);

      const totalRevenue = conversions?.reduce((sum, conv) => sum + Number(conv.revenue_amount), 0) || 0;

      // Get individual rep performance
      const { data: repPerformance } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          daily_visits!daily_visits_rep_id_fkey(id),
          leads!leads_created_by_fkey(id),
          conversions!conversions_rep_id_fkey(revenue_amount)
        `);

      return {
        teamSize: teamMembers?.length || 0,
        totalVisits: totalVisits || 0,
        totalLeads: totalLeads || 0,
        totalRevenue,
        totalConversions: conversions?.length || 0,
        repPerformance: repPerformance || []
      };
    }
  });

  const statCards = [
    {
      title: "Team Members",
      value: teamStats?.teamSize || 0,
      icon: Users,
      color: "blue",
      description: "Active representatives"
    },
    {
      title: "Total Visits",
      value: teamStats?.totalVisits || 0,
      icon: TrendingUp,
      color: "green",
      description: "This month"
    },
    {
      title: "Total Leads",
      value: teamStats?.totalLeads || 0,
      icon: Target,
      color: "purple",
      description: "This month"
    },
    {
      title: "Revenue",
      value: `$${teamStats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "orange",
      description: "This month"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Overview</h2>
        <p className="text-gray-600">Monitor your team's performance and progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Team Performance Table */}
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Representative</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Visits</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Leads</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {teamStats?.repPerformance?.map((rep: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{rep.full_name || "Unknown"}</td>
                  <td className="py-3 px-4 text-gray-600">{rep.daily_visits?.length || 0}</td>
                  <td className="py-3 px-4 text-gray-600">{rep.leads?.length || 0}</td>
                  <td className="py-3 px-4 text-gray-600">
                    ${rep.conversions?.reduce((sum: number, conv: any) => sum + Number(conv.revenue_amount || 0), 0)?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
