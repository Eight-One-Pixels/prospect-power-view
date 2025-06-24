import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReportFilters } from "./ReportFilters";
import { toast } from "sonner";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";
import { getUserCurrencyContext, convertCurrency } from "@/lib/currency";

export const ConversionReports = () => {
  const { user, userRole } = useAuth();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [convertedTotals, setConvertedTotals] = useState<{ revenue: number, commission: number, avgDeal: number, base: string } | null>(null);

  const { data: conversions, isLoading } = useQuery({
    queryKey: ['conversion-reports', user?.id, userRole, dateRange],
    queryFn: async () => {
      if (!user) return [];
      
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

      const { data, error } = await query.order('conversion_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  useEffect(() => {
    async function convertAll() {
      if (!user || !conversions) return;
      const { base } = await getUserCurrencyContext(user);
      let revenue = 0;
      let commission = 0;
      let avgDeal = 0;
      if (conversions.length > 0) {
        const revenueArr = await Promise.all(
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
        revenue = revenueArr.reduce((sum, val) => sum + val, 0);
        const commissionArr = await Promise.all(
          conversions.map(async (conv) => {
            const amount = Number(conv.commission_amount) || 0;
            const fromCurrency = conv.currency || 'USD';
            try {
              return await convertCurrency(amount, fromCurrency, base);
            } catch {
              return amount;
            }
          })
        );
        commission = commissionArr.reduce((sum, val) => sum + val, 0);
        avgDeal = conversions.length ? revenue / conversions.length : 0;
      }
      setConvertedTotals({ revenue, commission, avgDeal, base });
    }
    convertAll();
  }, [user, conversions]);

  const exportReport = () => {
    if (!conversions || conversions.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvContent = [
      ['Date', 'Company', 'Contact', 'Source', 'Revenue', 'Currency', 'Commission', 'Notes'].join(','),
      ...conversions.map(conv => [
        format(new Date(conv.conversion_date), 'yyyy-MM-dd'),
        `"${conv.leads?.company_name || 'N/A'}"`,
        `"${conv.leads?.contact_name || 'N/A'}"`,
        conv.leads?.source || 'N/A',
        conv.revenue_amount,
        conv.currency || 'USD',
        conv.commission_amount || 0,
        `"${conv.notes || ''}"`.replace(/"/g, '""')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversion-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  const totalRevenue = conversions?.reduce((sum, conv) => 
    sum + Number(conv.revenue_amount), 0
  ) || 0;

  const totalCommission = conversions?.reduce((sum, conv) => 
    sum + (Number(conv.commission_amount) || 0), 0
  ) || 0;

  const avgDealSize = conversions?.length ? totalRevenue / conversions.length : 0;

  return (
    <div className="space-y-6">
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={exportReport}
        exportLabel="Export Conversion Report"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{conversions?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Conversions</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {convertedTotals ? `${convertedTotals.base} ${convertedTotals.revenue.toLocaleString()}` : '...'}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {convertedTotals ? `${convertedTotals.base} ${convertedTotals.commission.toLocaleString()}` : '...'}
          </div>
          <div className="text-sm text-gray-600">Total Commission</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {convertedTotals ? `${convertedTotals.base} ${convertedTotals.avgDeal.toLocaleString()}` : '...'}
          </div>
          <div className="text-sm text-gray-600">Avg Deal Size</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Conversion Details</h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversions?.map((conversion) => (
                  <TableRow key={conversion.id}>
                    <TableCell>{format(new Date(conversion.conversion_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium">{conversion.leads?.company_name || 'N/A'}</TableCell>
                    <TableCell>{conversion.leads?.contact_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{conversion.leads?.source || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* <DollarSign className="h-4 w-4 text-green-600" /> */}
                        <span className="font-semibold text-green-600">
                          {conversion.currency} {Number(conversion.revenue_amount).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {conversion.commission_amount ? (
                        <div>
                          <span className="font-medium">
                            {conversion.currency} {Number(conversion.commission_amount).toLocaleString()}
                          </span>
                          {conversion.commission_rate && (
                            <p className="text-xs text-gray-600">
                              ({conversion.commission_rate}%)
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {conversion.notes || 'No notes'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
