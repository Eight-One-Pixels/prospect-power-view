
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface LogVisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogVisitForm = ({ open, onOpenChange }: LogVisitFormProps) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [visitType, setVisitType] = useState("");
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [visitTime, setVisitTime] = useState("");
  const [duration, setDuration] = useState("");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [leadGenerated, setLeadGenerated] = useState(false);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const visitData = {
        rep_id: user.id,
        company_name: companyName,
        contact_person: contactPerson || null,
        contact_email: contactEmail || null,
        visit_type: visitType,
        visit_date: format(visitDate, 'yyyy-MM-dd'),
        visit_time: visitTime || null,
        duration_minutes: duration ? parseInt(duration) : null,
        outcome: outcome || null,
        notes: notes || null,
        lead_generated: leadGenerated,
        follow_up_required: followUpRequired,
        follow_up_date: followUpDate ? format(followUpDate, 'yyyy-MM-dd') : null,
        status: visitDate > new Date() ? 'scheduled' : 'completed'
      };

      const { error: visitError } = await supabase
        .from('daily_visits')
        .insert(visitData);

      if (visitError) throw visitError;

      // If lead was generated, create a lead entry
      if (leadGenerated && companyName && contactPerson) {
        const leadData = {
          created_by: user.id,
          company_name: companyName,
          contact_name: contactPerson,
          contact_email: contactEmail || null,
          contact_phone: '', // Will need to be filled later
          source: 'Visit',
          status: 'new',
          notes: `Generated from visit on ${format(visitDate, 'yyyy-MM-dd')}`
        };

        const { error: leadError } = await supabase
          .from('leads')
          .insert(leadData);

        if (leadError) {
          console.warn('Failed to create lead:', leadError);
          toast.warning("Visit logged but failed to create lead automatically");
        }
      }

      toast.success(visitDate > new Date() ? "Visit scheduled successfully!" : "Visit logged successfully!");
      onOpenChange(false);
      
      // Reset form
      setCompanyName("");
      setContactPerson("");
      setContactEmail("");
      setVisitType("");
      setVisitTime("");
      setDuration("");
      setOutcome("");
      setNotes("");
      setLeadGenerated(false);
      setFollowUpRequired(false);
      setFollowUpDate(undefined);
    } catch (error) {
      console.error('Error saving visit:', error);
      toast.error("Failed to save visit");
    } finally {
      setLoading(false);
    }
  };

  const isScheduled = visitDate > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isScheduled ? 'Schedule Visit' : 'Log Visit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitType">Visit Type *</Label>
            <Select value={visitType} onValueChange={setVisitType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select visit type" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value="cold_call">Cold Call</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="phone_call">Phone Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(visitDate, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={visitDate}
                    onSelect={(date) => date && setVisitDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitTime">Visit Time</Label>
              <Input
                id="visitTime"
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
              />
            </div>
          </div>

          {!isScheduled && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome</Label>
            <Textarea
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder={isScheduled ? "Expected outcome..." : "What was the result of this visit?"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="leadGenerated"
                checked={leadGenerated}
                onCheckedChange={(checked) => setLeadGenerated(checked as boolean)}
              />
              <Label htmlFor="leadGenerated">
                {isScheduled ? "Expect to generate lead" : "Lead generated from this visit"}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={followUpRequired}
                onCheckedChange={(checked) => setFollowUpRequired(checked as boolean)}
              />
              <Label htmlFor="followUpRequired">Follow-up required</Label>
            </div>

            {followUpRequired && (
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {followUpDate ? format(followUpDate, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border shadow-lg">
                    <Calendar
                      mode="single"
                      selected={followUpDate}
                      onSelect={setFollowUpDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (isScheduled ? "Schedule Visit" : "Log Visit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
