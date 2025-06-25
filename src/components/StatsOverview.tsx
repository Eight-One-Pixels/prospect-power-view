import { TrendingUp, TrendingDown, Users, DollarSign, Target, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsOverviewProps {
  filters: {
    dateRange: string;
    leadSource: string;
    status: string;
    assignee: string;
  };
}

export const StatsOverview = ({ filters }: StatsOverviewProps) => {
  const stats = [
    {
      title: "Total Leads",
      value: "1,247",
      change: "+18.2%",
      trend: "up",
      icon: Users,
      color: "blue",
      description: "New leads this period"
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "+2.1%",
      trend: "up",
      icon: Target,
      color: "green",
      description: "Lead to customer conversion"
    },
    {
      title: "Total Revenue",
      value: "$89,420",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "purple",
      description: "Revenue generated"
    },
    {
      title: "Active Calls",
      value: "156",
      change: "-5.2%",
      trend: "down",
      icon: Phone,
      color: "orange",
      description: "Calls in progress"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        gradient: "from-blue-500 to-blue-600",
        text: "text-blue-600",
        bg: "bg-blue-50"
      },
      green: {
        gradient: "from-green-500 to-green-600",
        text: "text-green-600",
        bg: "bg-green-50"
      },
      purple: {
        gradient: "from-purple-500 to-purple-600",
        text: "text-purple-600",
        bg: "bg-purple-50"
      },
      orange: {
        gradient: "from-orange-500 to-orange-600",
        text: "text-orange-600",
        bg: "bg-orange-50"
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in">
      {stats.map((stat, index) => {
        const colorConfig = getColorClasses(stat.color);
        
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${colorConfig.gradient}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              {stat.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-semibold ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
