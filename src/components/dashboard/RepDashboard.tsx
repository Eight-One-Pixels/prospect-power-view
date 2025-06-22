
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Users, DollarSign, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddLeadForm } from "@/components/forms/AddLeadForm";
import { LogVisitForm } from "../forms/LogVisitForm";
import { SetGoalsForm } from "../forms/SetGoalsForm";


export const RepDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [logVisitOpen, setLogVisitOpen] = useState(false);
  const [setGoalsOpen, setSetGoalsOpen] = useState(false);

  // Fetch user's stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['rep-stats', user?.id, selectedPeriod],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date();
      const startDate = new Date();
      
      if (selectedPeriod === "week") {
        startDate.setDate(today.getDate() - 7);
      } else if (selectedPeriod === "month") {
        startDate.setMonth(today.getMonth() - 1);
      } else {
        startDate.setDate(today.getDate() - 1);
      }

      // Get visits count
      const { count: visitsCount } = await supabase
        .from('daily_visits')
        .select('*', { count: 'exact', head: true })
        .eq('rep_id', user.id)
        .gte('visit_date', startDate.toISOString().split('T')[0]);

      // Get leads count
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .gte('created_at', startDate.toISOString());

      // Get conversions and revenue
      const { data: conversions } = await supabase
        .from('conversions')
        .select('revenue_amount')
        .eq('rep_id', user.id)
        .gte('conversion_date', startDate.toISOString().split('T')[0]);

      const totalRevenue = conversions?.reduce((sum, conv) => sum + Number(conv.revenue_amount), 0) || 0;

      // Get current goals
      const { data: currentGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .lte('period_start', today.toISOString().split('T')[0])
        .gte('period_end', today.toISOString().split('T')[0]);

      return {
        visits: visitsCount || 0,
        leads: leadsCount || 0,
        revenue: totalRevenue,
        conversions: conversions?.length || 0,
        goals: currentGoals || []
      };
    },
    enabled: !!user
  });

  const statCards = [
    {
      title: "Visits",
      value: stats?.visits || 0,
      icon: Calendar,
      color: "blue",
      description: `This ${selectedPeriod}`
    },
    {
      title: "Leads Generated",
      value: stats?.leads || 0,
      icon: Users,
      color: "green",
      description: `This ${selectedPeriod}`
    },
    {
      title: "Revenue",
      value: `$${stats?.revenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "purple",
      description: `This ${selectedPeriod}`
    },
    {
      title: "Conversions",
      value: stats?.conversions || 0,
      icon: Target,
      color: "orange",
      description: `This ${selectedPeriod}`
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
      {/* Quick Actions */}
      <div onClick={() => setLogVisitOpen(true)} className="flex flex-wrap gap-4">
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Log Visit
        </Button>
        <Button onClick={() => setAddLeadOpen(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
        <Button onClick={() => setSetGoalsOpen(true)} variant="outline">
          <Target className="h-4 w-4 mr-2" />
          Set Goals
        </Button>
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

      {/* Goals Progress */}
      {stats?.goals && stats.goals.length > 0 && (
        <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Current Goals</h3>
          <div className="space-y-4">
            {stats.goals.map((goal: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900 capitalize">{goal.goal_type}</h4>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {Number(goal.current_value)} / {Number(goal.target_value)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {Math.round((Number(goal.current_value) / Number(goal.target_value)) * 100)}% Complete
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <LogVisitForm open={logVisitOpen} onOpenChange={setLogVisitOpen} />
      <AddLeadForm open={addLeadOpen} onOpenChange={setAddLeadOpen} />
      <SetGoalsForm open={setGoalsOpen} onOpenChange={setSetGoalsOpen} />
    </div>
  );
};
