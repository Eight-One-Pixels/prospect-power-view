
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Phone, Mail } from "lucide-react";

interface TeamPerformanceProps {
  filters: {
    dateRange: string;
    leadSource: string;
    status: string;
    assignee: string;
  };
}

export const TeamPerformance = ({ filters }: TeamPerformanceProps) => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Digital Marketing Lead",
      type: "digital",
      avatar: "SJ",
      leads: 42,
      conversions: 18,
      revenue: 24500,
      target: 25000,
      status: "online"
    },
    {
      name: "Mike Chen",
      role: "On-site Sales Rep",
      type: "onsite",
      avatar: "MC",
      leads: 38,
      conversions: 22,
      revenue: 31200,
      target: 30000,
      status: "online"
    },
    {
      name: "Emma Davis",
      role: "Digital Marketing Specialist",
      type: "digital",
      avatar: "ED",
      leads: 35,
      conversions: 14,
      revenue: 18900,
      target: 20000,
      status: "away"
    },
    {
      name: "John Smith",
      role: "On-site Sales Rep",
      type: "onsite",
      avatar: "JS",
      leads: 29,
      conversions: 16,
      revenue: 22800,
      target: 25000,
      status: "online"
    },
  ];

  const getConversionRate = (conversions: number, leads: number) => {
    return ((conversions / leads) * 100).toFixed(1);
  };

  const getProgressPercentage = (revenue: number, target: number) => {
    return Math.min((revenue / target) * 100, 100);
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Team Performance</h3>
          <p className="text-gray-600">Individual rep metrics</p>
        </div>
        <Trophy className="h-6 w-6 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  <Badge variant={member.type === 'digital' ? 'default' : 'secondary'}>
                    {member.type === 'digital' ? 'Digital' : 'On-site'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Leads</p>
                      <p className="font-semibold text-gray-900">{member.leads}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Conversions</p>
                      <p className="font-semibold text-gray-900">{member.conversions}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Revenue Progress</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${member.revenue.toLocaleString()} / ${member.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(member.revenue, member.target)} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Conversion Rate: <span className="font-semibold text-green-600">
                      {getConversionRate(member.conversions, member.leads)}%
                    </span>
                  </span>
                  <span className={`font-semibold ${
                    member.revenue >= member.target ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {member.revenue >= member.target ? 'Target Met' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
