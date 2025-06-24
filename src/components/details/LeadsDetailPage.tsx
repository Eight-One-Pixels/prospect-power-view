import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, TrendingUp, Edit, Trash2 } from "lucide-react";

interface LeadsDetailPageProps {
  onBack: () => void;
}

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'TND' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'MWK', name: 'Malawi Kwacha', symbol: 'MK' }
];

export const LeadsDetailPage = ({ onBack }: LeadsDetailPageProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [revenueAmount, setRevenueAmount] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [conversionNotes, setConversionNotes] = useState("");
  const [converting, setConverting] = useState(false);

  // Edit form states
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editContactName, setEditContactName] = useState("");
  const [editContactEmail, setEditContactEmail] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editEstimatedRevenue, setEditEstimatedRevenue] = useState("");
  const [editNotes, setEditNotes] = useState("");

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

  const deleteMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['user-leads'] });
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error("Failed to delete lead");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const { error } = await supabase
        .from('leads')
        .update({
          company_name: leadData.company_name,
          contact_name: leadData.contact_name,
          contact_email: leadData.contact_email,
          contact_phone: leadData.contact_phone,
          source: leadData.source,
          status: leadData.status,
          currency: leadData.currency,
          estimated_revenue: leadData.estimated_revenue ? parseFloat(leadData.estimated_revenue) : null,
          notes: leadData.notes
        })
        .eq('id', leadData.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead updated successfully!");
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['user-leads'] });
    },
    onError: (error) => {
      console.error('Error updating lead:', error);
      toast.error("Failed to update lead");
    }
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

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setEditCompanyName(lead.company_name);
    setEditContactName(lead.contact_name);
    setEditContactEmail(lead.contact_email || '');
    setEditContactPhone(lead.contact_phone);
    setEditSource(lead.source);
    setEditStatus(lead.status);
    setEditCurrency(lead.currency || 'USD');
    setEditEstimatedRevenue(lead.estimated_revenue ? lead.estimated_revenue.toString() : '');
    setEditNotes(lead.notes || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedLead) return;

    updateMutation.mutate({
      id: selectedLead.id,
      company_name: editCompanyName,
      contact_name: editContactName,
      contact_email: editContactEmail,
      contact_phone: editContactPhone,
      source: editSource,
      status: editStatus,
      currency: editCurrency,
      estimated_revenue: editEstimatedRevenue,
      notes: editNotes
    });
  };

  const handleDelete = (lead: any) => {
    if (window.confirm(`Are you sure you want to delete the lead for ${lead.company_name}?`)) {
      deleteMutation.mutate(lead.id);
    }
  };

  const handleConvert = async () => {
    if (!selectedLead || !user || !revenueAmount) return;

    setConverting(true);
    try {
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
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(lead)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(lead)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editCompanyName">Company Name</Label>
              <Input
                id="editCompanyName"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContactName">Contact Name</Label>
              <Input
                id="editContactName"
                value={editContactName}
                onChange={(e) => setEditContactName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContactEmail">Email</Label>
              <Input
                id="editContactEmail"
                type="email"
                value={editContactEmail}
                onChange={(e) => setEditContactEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContactPhone">Phone</Label>
              <Input
                id="editContactPhone"
                value={editContactPhone}
                onChange={(e) => setEditContactPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCurrency">Currency</Label>
                <Select value={editCurrency} onValueChange={setEditCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg max-h-60">
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEstimatedRevenue">Estimated Revenue</Label>
                <Input
                  id="editEstimatedRevenue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editEstimatedRevenue}
                  onChange={(e) => setEditEstimatedRevenue(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editSource">Lead Source</Label>
              <Select value={editSource} onValueChange={setEditSource} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal Sent</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Lead"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert Dialog - keep existing code */}
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
