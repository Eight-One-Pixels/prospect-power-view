import { useState } from "react";
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
}

export const AddLeadForm = ({ open, onOpenChange }: AddLeadFormProps) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<"new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost">("new");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
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
          notes
        });

      if (error) throw error;

      // Increment current_value for 'leads' goal
      const today = new Date();
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('current_value')
        .eq('user_id', user.id)
        .eq('goal_type', 'leads')
        .lte('period_start', today.toISOString().split('T')[0])
        .gte('period_end', today.toISOString().split('T')[0])
        .single();

      if (goalError) throw goalError;

      await supabase
        .from('goals')
        .update({ current_value: (goalData?.current_value ?? 0) + 1 })
        .eq('user_id', user.id)
        .eq('goal_type', 'leads')
        .lte('period_start', today.toISOString().split('T')[0])
        .gte('period_end', today.toISOString().split('T')[0]);

      toast.success("Lead added successfully!");
      onOpenChange(false);
      // Reset form
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setAddress("");
      setSource("");
      setStatus("new");
      setNotes("");
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error("Failed to add lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Lead Source</Label>
            <Select value={source} onValueChange={setSource} required>
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
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
