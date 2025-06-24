import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { getUserCurrencyContext, convertCurrency } from "@/lib/currency";
import { useEffect, useState } from "react";

interface ConversionsDetailPageProps {
  onBack: () => void;
}

export const ConversionsDetailPage = ({ onBack }: ConversionsDetailPageProps) => {
  const { user } = useAuth();

  const { data: conversions, isLoading } = useQuery({
    queryKey: ['user-conversions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('conversions')
        .select(`
          *,
          leads (
            company_name,
            contact_name,
            source
          )
        `)
        .eq('rep_id', user.id)
        .order('conversion_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Currency conversion logic
  const [convertedTotals, setConvertedTotals] = useState<{ revenue: number, commission: number, base: string } | null>(null);
  useEffect(() => {
    async function convertAll() {
      if (!user || !conversions) return;
      const { base } = await getUserCurrencyContext(user);
      let revenue = 0;
      let commission = 0;
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
      }
      setConvertedTotals({ revenue, commission, base });
    }
    convertAll();
  }, [user, conversions]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const totalRevenue = conversions?.reduce((sum, conv) => sum + Number(conv.revenue_amount), 0) || 0;
  const totalCommission = conversions?.reduce((sum, conv) => sum + (Number(conv.commission_amount) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">All Conversions</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Conversions</p>
              <p className="text-2xl font-bold">{conversions?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">
                {convertedTotals ? `${convertedTotals.base} ${convertedTotals.revenue.toLocaleString()}` : '...'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold">
                {convertedTotals ? `${convertedTotals.base} ${convertedTotals.commission.toLocaleString()}` : '...'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(conversion.conversion_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {conversion.leads?.company_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {conversion.leads?.contact_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {conversion.leads?.source || 'N/A'}
                    </Badge>
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

        {conversions?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No conversions recorded yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
