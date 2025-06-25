
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Target, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getUserCurrencyContext, convertCurrency } from "@/lib/currency";
import { DetailedVisitsTable } from "../tables/DetailedVisitsTable";
import { DetailedLeadsTable } from "../tables/DetailedLeadsTable";
import { DetailedConversionsTable } from "../tables/DetailedConversionsTable";

export const ManageTeamDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [convertedTotals, setConvertedTotals] = useState<{ revenue: number, base: string } | null>(null);
  const [showVisitsTable, setShowVisitsTable] = useState(false);
  const [showLeadsTable, setShowLeadsTable] = useState(false);
  const [showConversionsTable, setShowConversionsTable] = useState(false);

  // Fetch team overview stats
  const { data: teamStats, isLoading } = useQuery({
    queryKey: ['team-stats', selectedPeriod],
    queryFn: async () => {
      const today = new Date();
      let startDate: Date;
      
      if (selectedPeriod === "day") {
        startDate = today;
      } else if (selectedPeriod === "week") {
        startDate = new Date(today.setDate(today.getDate() - 7));
      } else {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      }
      
      // Get all team members with their roles
      const { data: teamMembers } = await supabase
        .from('profiles_with_roles')
        .select('*');

      // Get total visits
      const { count: totalVisits } = await supabase
        .from('daily_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', startDate.toISOString().split('T')[0]);

      // Get total leads
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Get total conversions and revenue
      const { data: conversions } = await supabase
        .from('conversions')
        .select('revenue_amount, currency')
        .gte('conversion_date', startDate.toISOString().split('T')[0]);

      return {
        teamSize: teamMembers?.length || 0,
        totalVisits: totalVisits || 0,
        totalLeads: totalLeads || 0,
        totalConversions: conversions?.length || 0,
        conversions: conversions || [],
        teamMembers: teamMembers || []
      };
    }
  });

  // Convert revenue to user's preferred currency
  useEffect(() => {
    async function convertAll() {
      if (!user || !teamStats?.conversions) return;
      const { base } = await getUserCurrencyContext(user);
      let revenue = 0;
      if (teamStats.conversions.length > 0) {
        const revenueArr = await Promise.all(
          teamStats.conversions.map(async (conv) => {
            const amount = Number(conv.revenue_amount) || 0;
            const fromCurrency = conv.currency || 'USD';
            try {
              return await convertCurrency(amount, fromCurrency, base);
            } catch {
              return amount;
            }
          })
        );
        revenue = revenueArr.reduce((sum, val) => sum + val, 0);
      }
      setConvertedTotals({ revenue, base });
    }
    convertAll();
  }, [user, teamStats]);

  // Fetch individual rep performance
  const { data: repPerformance, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['rep-performance', selectedPeriod],
    queryFn: async () => {
      const today = new Date();
      let startDate: Date;
      
      if (selectedPeriod === "day") {
        startDate = today;
      } else if (selectedPeriod === "week") {
        startDate = new Date(today.setDate(today.getDate() - 7));
      } else {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      }

      // Get all reps with their performance data
      const { data: reps } = await supabase
        .from('profiles_with_roles')
        .select('*')
        .in('role', ['rep', 'manager']);

      if (!reps) return [];

      const repData = await Promise.all(
        reps.map(async (rep) => {
          // Get visits for this rep
          const { count: visits } = await supabase
            .from('daily_visits')
            .select('*', { count: 'exact', head: true })
            .eq('rep_id', rep.id)
            .gte('visit_date', startDate.toISOString().split('T')[0]);

          // Get leads for this rep
          const { count: leads } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', rep.id)
            .gte('created_at', startDate.toISOString());

          // Get conversions and revenue for this rep
          const { data: conversions } = await supabase
            .from('conversions')
            .select('revenue_amount, currency')
            .eq('rep_id', rep.id)
            .gte('conversion_date', startDate.toISOString().split('T')[0]);

          // Convert revenue to user's base currency
          let revenue = 0;
          if (conversions && conversions.length > 0 && user) {
            const { base } = await getUserCurrencyContext(user);
            const convertedAmounts = await Promise.all(
              conversions.map(async (conv) => {
                const amount = Number(conv.revenue_amount) || 0;
                const fromCurrency = conv.currency || 'USD';
                try {
                  return await convertCurrency(amount, fromCurrency, base);
                } catch {
                  return amount;
                }
              })
            );
            revenue = convertedAmounts.reduce((sum, val) => sum + val, 0);
          }

          return {
            ...rep,
            visits: visits || 0,
            leads: leads || 0,
            revenue,
            conversions: conversions?.length || 0
          };
        })
      );

      return repData;
    }
  });

  const statCards = [
    {
      title: "Team Members",
      value: teamStats?.teamSize || 0,
      icon: Users,
      color: "blue",
      description: "Active representatives",
      onClick: null
    },
    {
      title: `${selectedPeriod === 'day' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'This Month'} Visits`,
      value: teamStats?.totalVisits || 0,
      icon: TrendingUp,
      color: "green",
      description: "All teams",
      onClick: () => setShowVisitsTable(true)
    },
    {
      title: `${selectedPeriod === 'day' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'This Month'} Leads`,
      value: teamStats?.totalLeads || 0,
      icon: Target,
      color: "purple",
      description: "Organization wide",
      onClick: () => setShowLeadsTable(true)
    },
    {
      title: "Revenue",
      value: convertedTotals ? `${convertedTotals.base} ${convertedTotals.revenue.toLocaleString()}` : '...',
      icon: DollarSign,
      color: "orange",
      description: `${selectedPeriod === 'day' ? 'Today' : selectedPeriod === 'week' ? 'This week' : 'This month'}`,
      onClick: () => setShowConversionsTable(true)
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || isLoadingPerformance) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Overview</h2>
        <p className="text-gray-600">Monitor your team's performance and progress</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Button 
          variant={selectedPeriod === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedPeriod("day")}
        >
          Today
        </Button>
        <Button 
          variant={selectedPeriod === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedPeriod("week")}
        >
          This Week
        </Button>
        <Button 
          variant={selectedPeriod === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedPeriod("month")}
        >
          This Month
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className={`p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md bg-white/70 backdrop-blur-sm ${
              stat.onClick ? 'cursor-pointer' : ''
            }`}
            onClick={stat.onClick || undefined}
          >
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
        <div className="space-y-4">
          {repPerformance?.map((rep, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={rep?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold">
                    {rep?.full_name 
                      ? getInitials(rep.full_name)
                      : rep?.email ? getInitials(rep.email) : 'U'
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{rep.full_name || rep.email}</h4>
                      <p className="text-sm text-gray-600 capitalize">{rep.role}</p>
                    </div>
                    <Badge variant={rep.role === 'admin' ? 'default' : 'secondary'}>
                      {rep.role}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Visits</p>
                      <p className="font-semibold text-gray-900">{rep.visits}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Leads</p>
                      <p className="font-semibold text-gray-900">{rep.leads}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Conversions</p>
                      <p className="font-semibold text-gray-900">{rep.conversions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="font-semibold text-green-600">
                        {convertedTotals ? `${convertedTotals.base} ${rep.revenue.toLocaleString()}` : `USD ${rep.revenue.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Tables */}
      <DetailedVisitsTable 
        open={showVisitsTable} 
        onOpenChange={setShowVisitsTable}
        dateFilter={selectedPeriod as 'today' | 'week' | 'month'}
        title="Team Visits"
      />
      <DetailedLeadsTable 
        open={showLeadsTable} 
        onOpenChange={setShowLeadsTable}
        dateFilter={selectedPeriod as 'today' | 'week' | 'month'}
        title="Team Leads"
      />
      <DetailedConversionsTable 
        open={showConversionsTable} 
        onOpenChange={setShowConversionsTable}
        dateFilter={selectedPeriod as 'today' | 'week' | 'month'}
        title="Team Conversions"
      />
    </div>
  );
};
