
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp } from "lucide-react";

interface SalesChartProps {
  filters: {
    dateRange: string;
    leadSource: string;
    status: string;
    assignee: string;
  };
}

export const SalesChart = ({ filters }: SalesChartProps) => {
  const salesData = [
    { month: "Jan", revenue: 65000, leads: 120, conversions: 28 },
    { month: "Feb", revenue: 78000, leads: 135, conversions: 32 },
    { month: "Mar", revenue: 82000, leads: 148, conversions: 38 },
    { month: "Apr", revenue: 69000, leads: 126, conversions: 29 },
    { month: "May", revenue: 94000, leads: 162, conversions: 42 },
    { month: "Jun", revenue: 89000, leads: 154, conversions: 39 },
  ];

  const conversionData = [
    { source: "Website", conversions: 45, rate: 28.5 },
    { source: "Social Media", conversions: 32, rate: 22.1 },
    { source: "Email", conversions: 28, rate: 35.2 },
    { source: "Referral", conversions: 38, rate: 42.8 },
    { source: "Cold Call", conversions: 15, rate: 18.9 },
  ];

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Sales Performance</h3>
          <p className="text-gray-600">Revenue trends and conversion metrics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700">+12.5% Growth</span>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="url(#revenueGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#6366f1' }}
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Conversion by Source</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="source" type="category" width={80} stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="conversions" 
                  fill="url(#barGradient)"
                  radius={[0, 4, 4, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};
