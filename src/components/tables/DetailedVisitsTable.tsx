import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { AddLeadForm } from "../forms/AddLeadForm";
import { toast } from "sonner";
import { Repeat } from "lucide-react";

interface DetailedVisitsTableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateFilter?: 'today' | 'week' | 'month';
  title?: string;
  scope?: 'team' | 'user';
}

export const DetailedVisitsTable = ({ open, onOpenChange, dateFilter, title = "Detailed Visits", scope }: DetailedVisitsTableProps) => {
  const { user, userRole } = useAuth();
  const [convertingVisit, setConvertingVisit] = useState<any>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const { data: visits, isLoading } = useQuery({
    queryKey: ['detailed-visits', scope === 'team' ? 'team' : user?.id, userRole, dateFilter],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('daily_visits')
        .select(`
          *,
          profiles!inner(full_name, email)
        `);

      // Only filter by user if not team scope
      if (scope !== 'team' && !['manager', 'director', 'admin'].includes(userRole || '')) {
        query = query.eq('rep_id', user.id);
      }

      // Apply date filter
      const today = new Date();
      if (dateFilter === 'today') {
        query = query.eq('visit_date', format(today, 'yyyy-MM-dd'));
      } else if (dateFilter === 'week') {
        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        query = query.gte('visit_date', format(weekStart, 'yyyy-MM-dd'));
      } else if (dateFilter === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        query = query.gte('visit_date', format(monthStart, 'yyyy-MM-dd'));
      }

      const { data, error } = await query.order('visit_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && open
  });

  const handleConvertToLead = async (visit: any) => {
    setConvertingVisit(visit);
    setShowLeadForm(true);
  };

  const handleLeadCreated = async () => {
    // Update the visit to mark it as lead generated
    if (convertingVisit) {
      try {
        const { error } = await supabase
          .from('daily_visits')
          .update({ lead_generated: true })
          .eq('id', convertingVisit.id);

        if (error) throw error;
        toast.success("Visit converted to lead successfully!");
        setConvertingVisit(null);
        setShowLeadForm(false);
        // Refresh the data
        // queryClient.invalidateQueries({ queryKey: ['detailed-visits'] });
      } catch (error) {
        console.error('Error updating visit:', error);
        toast.error("Failed to update visit status");
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading visits...</div>;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] sm:max-h-[80vh] p-2 sm:p-6 rounded-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl">{title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table className="min-w-[600px] w-full text-xs sm:text-sm md:text-base">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Sales Rep</TableHead>
                  <TableHead>Lead Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits?.map((visit) => (
                  <TableRow key={visit.id} className="hover:bg-gray-50">
                    <TableCell>{format(new Date(visit.visit_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium max-w-[120px] truncate text-xs sm:text-sm">{visit.company_name}</TableCell>
                    <TableCell className="max-w-[100px] truncate text-xs sm:text-sm">{visit.contact_person || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs sm:text-sm">
                        {visit.visit_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{visit.duration_minutes ? `${visit.duration_minutes} min` : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="max-w-[120px] truncate text-xs sm:text-sm">{visit.outcome || 'No outcome recorded'}</div>
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate text-xs sm:text-sm">{visit.profiles?.full_name || visit.profiles?.email || 'Unknown'}</TableCell>
                    <TableCell>
                      {visit.lead_generated ? (
                        <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs sm:text-sm">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!visit.lead_generated && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto text-xs sm:text-sm"
                          onClick={() => handleConvertToLead(visit)}
                        >
                          <Repeat className="h-4 w-4" />
                          To Lead
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {visits?.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              No visits found for the selected period.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {convertingVisit && (
        <AddLeadForm
          open={showLeadForm}
          onOpenChange={setShowLeadForm}
          onLeadCreated={handleLeadCreated}
        />
      )}
    </>
  );
};
