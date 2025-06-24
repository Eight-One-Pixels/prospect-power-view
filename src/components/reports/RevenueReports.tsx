
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportFilters } from "./ReportFilters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export const RevenueReports = () => {
  const { user, userRole } = useAuth();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subMonths(new Date(), 11),
    to: new Date()
  });
  const [groupBy, setGroupBy] = useState("month");

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-reports', user?.id, userRole, dateRange, groupBy],
    queryFn: async () => {
      if (!user) return { conversions: [], monthlyData: [], currencyData: [] };
      
      let query = supabase
        .from('conversions')
        .select(`
          *,
          leads (
            company_name,
            contact_name,
            source
          )
        `);

      // Filter by user if not manager/admin
      if (!['manager', 'director', 'admin'].includes(userRole || '')) {
        query = query.eq('rep_id', user.id);
      }

      // Apply date filter
      if (dateRange.from) {
        query = query.gte('conversion_date', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange.to) {
        query = query.lte('conversion_date', dateRange.to.toISOString().split('T')[0]);
      }

      const { data: conversions, error } = await query.order('conversion_date', { ascending: false });
      if (error) throw error;

      // Group data by month
      const monthlyData = eachMonthOfInterval({
        start: startOfMonth(dateRange.from || subMonths(new Date(), 11)),
        end: endOfMonth(dateRange.to || new Date())
      }).map(month => {
        const monthConversions = conversions?.filter(conv => {
          const convDate = new Date(conv.conversion_date);
          return convDate >= startOfMonth(month) && convDate <= endOfMonth(month);
        }) || [];

        return {
          month: format(month, 'MMM yyyy'),
          revenue: monthConversions.reduce((sum, conv) => sum + Number(conv.revenue_amount), 0),
          commission: monthConversions.reduce((sum, conv) => sum + (Number(conv.commission_amount) || 0), 0),
          conversions: monthConversions.length
        };
      });

      // Group by currency
      const currencyData = conversions?.reduce((acc, conv) => {
        const currency = conv.currency || 'USD';
        const existing = acc.find(item => item.currency === currency);
        if (existing) {
          existing.revenue += Number(conv.revenue_amount);
          existing.conversions += 1;
        } else {
          acc.push({
            currency,
            revenue: Number(conv.revenue_amount),
            conversions: 1
          });
        }
        return acc;
      }, [] as Array<{ currency: string; revenue: number; conversions: number }>) || [];

      return { conversions: conversions || [], monthlyData, currencyData };
    },
    enabled: !!user
  });

  const exportReport = () => {
    if (!revenueData?.conversions || revenueData.conversions.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvContent = [
      ['Report Type', 'Revenue Analysis'],
      ['Period', `${dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''} to ${dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}`],
      [''],
      ['Monthly Revenue'],
      ['Month', 'Revenue', 'Commission', 'Conversions'],
      ...revenueData.monthlyData.map(item => [
        item.month,
        item.revenue,
        item.commission,
        item.conversions
      ]),
      [''],
      ['Currency Breakdown'],
      ['Currency', 'Revenue', 'Conversions'],
      ...revenueData.currencyData.map(item => [
        item.currency,
        item.revenue,
        item.conversions
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  const totalRevenue = revenueData?.conversions?.reduce((sum, conv) => 
    sum + Number(conv.revenue_amount), 0
  ) || 0;

  const totalCommission = revenueData?.conversions?.reduce((sum, conv) => 
    sum + (Number(conv.commission_amount) || 0), 0
  ) || 0;

  const avgCommissionRate = revenueData?.conversions?.length ? 
    (totalCommission / totalRevenue * 100) : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={exportReport}
        exportLabel="Export Revenue Report"
        additionalFilters={
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Group By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">By Month</SelectItem>
              <SelectItem value="quarter">By Quarter</SelectItem>
              <SelectItem value="year">By Year</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">${totalCommission.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Commission</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{avgCommissionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Commission Rate</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{revenueData?.conversions?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Conversions</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue by Currency</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData?.currencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ currency, percent }) => `${currency} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueData?.currencyData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
};
