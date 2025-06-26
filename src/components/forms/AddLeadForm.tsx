import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AddLeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated?: () => void;
  initialValues?: {
    company_name?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
    address?: string;
    source?: string;
    status?: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
    currency?: string;
    estimated_revenue?: string;
    date?: string;
  };
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

export const AddLeadForm = ({ open, onOpenChange, onLeadCreated, initialValues }: AddLeadFormProps) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState(initialValues?.company_name || "");
  const [contactName, setContactName] = useState(initialValues?.contact_name || "");
  const [contactEmail, setContactEmail] = useState(initialValues?.contact_email || "");
  const [contactPhone, setContactPhone] = useState(initialValues?.contact_phone || "");
  const [notes, setNotes] = useState(initialValues?.notes || "");
  const [address, setAddress] = useState( initialValues?.address || "");
  const [source, setSource] = useState(initialValues?.source || "");
  const [status, setStatus] = useState<"new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost">(initialValues?.status || "new");
  const [currency, setCurrency] = useState(initialValues?.currency || "USD");
  const [estimatedRevenue, setEstimatedRevenue] = useState(initialValues?.estimated_revenue || "");
  const [date, setDate] = useState(initialValues?.date || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCompanyName(initialValues?.company_name || "");
    setContactName(initialValues?.contact_name || "");
    setContactEmail(initialValues?.contact_email || "");
    setContactPhone(initialValues?.contact_phone || "");
    setNotes(initialValues?.notes || "");
    setAddress(initialValues?.address || "");
    setSource(initialValues?.source || "");
    setStatus(initialValues?.status || "new");
    setCurrency(initialValues?.currency || "USD");
    setEstimatedRevenue(initialValues?.estimated_revenue || "");
    setDate(initialValues?.date || new Date().toISOString().split("T")[0]);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Insert new lead
      const { error } = await supabase
        .from('leads')
        .insert({
          created_by: user.id,
          company_name: companyName,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          address,
          source,
          status,
          notes,
          currency,
          estimated_revenue: estimatedRevenue ? parseFloat(estimatedRevenue) : null,
          created_at: date || null
        });

      if (error) throw error;

      // Check for an existing goal
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const { data: goals, error: goalError } = await supabase
        .from('goals')
        .select('current_value')
        .eq('user_id', user.id)
        .eq('goal_type', 'leads')
        .lte('period_start', todayStr)
        .gte('period_end', todayStr);

      if (goalError) throw goalError;

      // Only increment if there's a matching goal
      if (goals && goals.length > 0) {
        const currentValue = goals[0].current_value || 0;
        await supabase
          .from('goals')
          .update({ current_value: currentValue + 1 })
          .eq('user_id', user.id)
          .eq('goal_type', 'leads')
          .lte('period_start', todayStr)
          .gte('period_end', todayStr);
      }

      toast.success('Lead added successfully!');
      onOpenChange(false);
      if (onLeadCreated) onLeadCreated();

      // Reset the form
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setAddress("");
      setSource("");
      setStatus("new");
      setNotes("");
      setCurrency("USD");
      setEstimatedRevenue("");
      setDate("");
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto w-full px-2 py-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg max-h-60">
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code} className="text-sm sm:text-base">
                      {curr.symbol} {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedRevenue">Estimated Revenue</Label>
              <Input
                id="estimatedRevenue"
                type="number"
                step="0.01"
                min="0"
                value={estimatedRevenue}
                onChange={(e) => setEstimatedRevenue(e.target.value)}
                required
                placeholder="0.00"
                className="w-full text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Lead Source</Label>
            <Select value={source} onValueChange={setSource} required>
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value="referral" className="text-sm sm:text-base">Referral</SelectItem>
                <SelectItem value="website" className="text-sm sm:text-base">Website</SelectItem>
                <SelectItem value="social_media" className="text-sm sm:text-base">Social Media</SelectItem>
                <SelectItem value="cold_call" className="text-sm sm:text-base">Cold Call</SelectItem>
                <SelectItem value="event" className="text-sm sm:text-base">Event</SelectItem>
                <SelectItem value="other" className="text-sm sm:text-base">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value="new" className="text-sm sm:text-base">New</SelectItem>
                <SelectItem value="contacted" className="text-sm sm:text-base">Contacted</SelectItem>
                <SelectItem value="qualified" className="text-sm sm:text-base">Qualified</SelectItem>
                <SelectItem value="proposal" className="text-sm sm:text-base">Proposal Sent</SelectItem>
                <SelectItem value="negotiation" className="text-sm sm:text-base">Negotiation</SelectItem>
                <SelectItem value="closed_won" className="text-sm sm:text-base">Closed Won</SelectItem>
                <SelectItem value="closed_lost" className="text-sm sm:text-base">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full text-sm sm:text-base min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Add Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
