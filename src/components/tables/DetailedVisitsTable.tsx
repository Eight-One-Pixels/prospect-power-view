
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

interface DetailedVisitsTableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateFilter?: 'today' | 'week' | 'month';
  title?: string;
}

export const DetailedVisitsTable = ({ open, onOpenChange, dateFilter, title = "Detailed Visits" }: DetailedVisitsTableProps) => {
  const { user, userRole } = useAuth();
  const [convertingVisit, setConvertingVisit] = useState<any>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const { data: visits, isLoading } = useQuery({
    queryKey: ['detailed-visits', user?.id, userRole, dateFilter],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('daily_visits')
        .select(`
          *,
          profiles!inner(full_name, email)
        `);

      // Filter by user if not manager/admin
      if (!['manager', 'director', 'admin'].includes(userRole || '')) {
        query = query.eq('rep_id', user.id);
      }

      // Apply date filter
      const today = new Date();
      if (dateFilter === 'today') {
        query = query.eq('visit_date', format(today, 'yyyy-MM-dd'));
      } else if (dateFilter === 'week') {
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
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
                  <TableRow key={visit.id}>
                    <TableCell>{format(new Date(visit.visit_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium">{visit.company_name}</TableCell>
                    <TableCell>{visit.contact_person || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {visit.visit_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{visit.duration_minutes ? `${visit.duration_minutes} min` : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{visit.outcome || 'No outcome recorded'}</div>
                    </TableCell>
                    <TableCell>{visit.profiles?.full_name || visit.profiles?.email || 'Unknown'}</TableCell>
                    <TableCell>
                      {visit.lead_generated ? (
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!visit.lead_generated && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvertToLead(visit)}
                        >
                          Convert to Lead
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {visits?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
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
