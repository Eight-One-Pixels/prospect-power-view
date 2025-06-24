
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, TrendingUp } from "lucide-react";

interface LeadsDetailPageProps {
  onBack: () => void;
}

export const LeadsDetailPage = ({ onBack }: LeadsDetailPageProps) => {
  const { user } = useAuth();
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [revenueAmount, setRevenueAmount] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [conversionNotes, setConversionNotes] = useState("");
  const [converting, setConverting] = useState(false);

  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ['user-leads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      qualified: "bg-purple-100 text-purple-800",
      proposal: "bg-orange-100 text-orange-800",
      negotiation: "bg-indigo-100 text-indigo-800",
      closed_won: "bg-green-100 text-green-800",
      closed_lost: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleConvert = async () => {
    if (!selectedLead || !user || !revenueAmount) return;

    setConverting(true);
    try {
      // Create conversion record
      const { error: conversionError } = await supabase
        .from('conversions')
        .insert({
          lead_id: selectedLead.id,
          rep_id: user.id,
          revenue_amount: parseFloat(revenueAmount),
          commission_rate: commissionRate ? parseFloat(commissionRate) : null,
          commission_amount: commissionRate ? (parseFloat(revenueAmount) * parseFloat(commissionRate)) / 100 : null,
          currency: selectedLead.currency || 'USD',
          notes: conversionNotes
        });

      if (conversionError) throw conversionError;

      // Update lead status to closed_won
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'closed_won' })
        .eq('id', selectedLead.id);

      if (updateError) throw updateError;

      // Update conversion goals
      const today = new Date();
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('current_value')
        .eq('user_id', user.id)
        .eq('goal_type', 'conversions')
        .lte('period_start', today.toISOString().split('T')[0])
        .gte('period_end', today.toISOString().split('T')[0])
        .single();

      if (!goalError && goalData) {
        await supabase
          .from('goals')
          .update({ current_value: (goalData.current_value ?? 0) + 1 })
          .eq('user_id', user.id)
          .eq('goal_type', 'conversions')
          .lte('period_start', today.toISOString().split('T')[0])
          .gte('period_end', today.toISOString().split('T')[0]);
      }

      toast.success("Lead converted successfully!");
      setConvertDialogOpen(false);
      setSelectedLead(null);
      setRevenueAmount("");
      setCommissionRate("");
      setConversionNotes("");
      refetch();
    } catch (error) {
      console.error('Error converting lead:', error);
      toast.error("Failed to convert lead");
    } finally {
      setConverting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">All Leads</h1>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Revenue</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.company_name}</p>
                      <p className="text-sm text-gray-600">{lead.contact_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{lead.contact_email}</p>
                      <p className="text-sm text-gray-600">{lead.contact_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.estimated_revenue ? (
                      <span className="font-medium">
                        {lead.currency} {Number(lead.estimated_revenue).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {lead.status !== 'closed_won' && lead.status !== 'closed_lost' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedLead(lead);
                          setConvertDialogOpen(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <TrendingUp className="h-3 w-3" />
                        Convert
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead to Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Company: {selectedLead?.company_name}</Label>
              <p className="text-sm text-gray-600">Contact: {selectedLead?.contact_name}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="revenueAmount">Actual Revenue Amount</Label>
              <Input
                id="revenueAmount"
                type="number"
                step="0.01"
                min="0"
                value={revenueAmount}
                onChange={(e) => setRevenueAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="5.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversionNotes">Notes</Label>
              <Textarea
                id="conversionNotes"
                value={conversionNotes}
                onChange={(e) => setConversionNotes(e.target.value)}
                placeholder="Any additional notes about this conversion..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConvertDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConvert} disabled={converting || !revenueAmount}>
                {converting ? "Converting..." : "Convert to Sale"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
