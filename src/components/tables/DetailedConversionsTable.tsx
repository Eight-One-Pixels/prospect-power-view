import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DetailedConversionsTableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateFilter?: 'today' | 'week' | 'month';
  title?: string;
  scope?: 'team' | 'user';
}

export const DetailedConversionsTable = ({ open, onOpenChange, dateFilter, title = "Detailed Conversions", scope }: DetailedConversionsTableProps) => {
  const { user, userRole } = useAuth();

  const { data: conversions, isLoading } = useQuery({
    queryKey: ['detailed-conversions', scope === 'team' ? 'team' : user?.id, userRole, dateFilter],
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
          ),
          profiles!inner(full_name, email)
        `);

      // Only filter by user if not team scope
      if (scope !== 'team' && !['manager', 'director', 'admin'].includes(userRole || '')) {
        query = query.eq('rep_id', user.id);
      }

      // Apply date filter
      const today = new Date();
      if (dateFilter === 'today') {
        query = query.eq('conversion_date', format(today, 'yyyy-MM-dd'));
      } else if (dateFilter === 'week') {
        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        query = query.gte('conversion_date', format(weekStart, 'yyyy-MM-dd'));
      } else if (dateFilter === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        query = query.gte('conversion_date', format(monthStart, 'yyyy-MM-dd'));
      }

      const { data, error } = await query.order('conversion_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && open
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading conversions...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
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
                <TableHead>Sales Rep</TableHead>
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
                    <span className="font-semibold text-green-600">
                      {conversion.currency || 'USD'} {Number(conversion.revenue_amount).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {conversion.commission_amount ? (
                      <div>
                        <span className="font-medium">
                          {conversion.currency || 'USD'} {Number(conversion.commission_amount).toLocaleString()}
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
                  <TableCell>{conversion.profiles?.full_name || conversion.profiles?.email || 'Unknown'}</TableCell>
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
            No conversions found for the selected period.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
