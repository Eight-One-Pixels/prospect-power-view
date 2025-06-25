import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DetailedLeadsTableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateFilter?: 'today' | 'week' | 'month';
  title?: string;
  scope?: 'team' | 'user';
}

export const DetailedLeadsTable = ({ open, onOpenChange, dateFilter, title = "Detailed Leads", scope }: DetailedLeadsTableProps) => {
  const { user, userRole } = useAuth();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['detailed-leads', scope === 'team' ? 'team' : user?.id, userRole, dateFilter],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('leads')
        .select(`
          *,
          profiles!inner(full_name, email)
        `);

      // Only filter by user if not team scope
      if (scope !== 'team' && !['manager', 'director', 'admin'].includes(userRole || '')) {
        query = query.eq('created_by', user.id);
      }

      // Apply date filter
      const today = new Date();
      if (dateFilter === 'today') {
        query = query.gte('created_at', format(today, 'yyyy-MM-dd'));
      } else if (dateFilter === 'week') {
        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        query = query.gte('created_at', format(weekStart, 'yyyy-MM-dd'));
      } else if (dateFilter === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        query = query.gte('created_at', format(monthStart, 'yyyy-MM-dd'));
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && open
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading leads...</div>;
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
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Estimated Value</TableHead>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Next Follow-up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{format(new Date(lead.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-medium">{lead.company_name}</TableCell>
                  <TableCell>
                    <div>
                      <div>{lead.contact_name}</div>
                      <div className="text-sm text-gray-500">{lead.contact_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={lead.status === 'closed_won' ? 'default' : 'outline'}
                      className={`capitalize ${
                        lead.status === 'closed_won' ? 'bg-green-100 text-green-800' :
                        lead.status === 'closed_lost' ? 'bg-red-100 text-red-800' : ''
                      }`}
                    >
                      {lead.status?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.source}</Badge>
                  </TableCell>
                  <TableCell>
                    {lead.estimated_revenue ? (
                      <span className="font-semibold text-green-600">
                        {lead.currency || 'USD'} {Number(lead.estimated_revenue).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{lead.profiles?.full_name || lead.profiles?.email || 'Unknown'}</TableCell>
                  <TableCell>
                    {lead.next_follow_up ? (
                      format(new Date(lead.next_follow_up), 'MMM dd, yyyy')
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {leads?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No leads found for the selected period.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
