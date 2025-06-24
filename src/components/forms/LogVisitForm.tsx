
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock, Mail, Calendar as CalendarIntegration } from "lucide-react";
import { format, isFuture, isPast } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LogVisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogVisitForm = ({ open, onOpenChange }: LogVisitFormProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>("09:00");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [visitType, setVisitType] = useState<"cold_call" | "follow_up" | "presentation" | "meeting" | "phone_call">("cold_call");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [leadGenerated, setLeadGenerated] = useState(false);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [sendEmailReminder, setSendEmailReminder] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const isScheduled = isFuture(date);
  const isCompleted = isPast(date) || date.toDateString() === new Date().toDateString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const visitDateTime = new Date(date);
      if (time) {
        const [hours, minutes] = time.split(':');
        visitDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      const visitData = {
        rep_id: user.id,
        visit_date: format(visitDateTime, 'yyyy-MM-dd'),
        visit_time: time || null,
        company_name: companyName,
        contact_person: contactPerson,
        contact_email: contactEmail || null,
        visit_type: visitType,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
        outcome: outcome || null,
        notes,
        lead_generated: leadGenerated,
        follow_up_required: followUpRequired,
        follow_up_date: followUpDate || null,
        status: isScheduled ? 'scheduled' : 'completed'
      };

      const { error } = await supabase
        .from('daily_visits')
        .insert(visitData);

      if (error) throw error;

      // Only increment goals for completed visits
      if (isCompleted) {
        const today = new Date();
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('current_value')
          .eq('user_id', user.id)
          .eq('goal_type', 'visits')
          .lte('period_start', today.toISOString().split('T')[0])
          .gte('period_end', today.toISOString().split('T')[0])
          .single();

        if (!goalError && goalData) {
          await supabase
            .from('goals')
            .update({ current_value: (goalData?.current_value ?? 0) + 1 })
            .eq('user_id', user.id)
            .eq('goal_type', 'visits')
            .lte('period_start', today.toISOString().split('T')[0])
            .gte('period_end', today.toISOString().split('T')[0]);
        }
      }

      // Handle email notifications for scheduled visits
      if (isScheduled && sendEmailReminder && contactEmail) {
        try {
          await supabase.functions.invoke('send-visit-reminder', {
            body: {
              to: contactEmail,
              visitData: {
                ...visitData,
                visit_datetime: visitDateTime.toISOString(),
                rep_name: user.user_metadata?.full_name || user.email
              }
            }
          });
          console.log('Email reminder sent successfully');
        } catch (emailError) {
          console.error('Failed to send email reminder:', emailError);
          toast.error("Visit saved but email reminder failed to send");
        }
      }

      // Handle calendar integration
      if (addToCalendar && isScheduled) {
        generateCalendarEvent(visitData, visitDateTime);
      }

      toast.success(isScheduled ? "Visit scheduled successfully!" : "Visit logged successfully!");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast.error("Failed to save visit");
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarEvent = (visitData: any, visitDateTime: Date) => {
    const startTime = visitDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = new Date(visitDateTime.getTime() + (parseInt(durationMinutes) || 60) * 60000)
      .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const title = encodeURIComponent(`${visitType.replace('_', ' ').toUpperCase()} - ${companyName}`);
    const details = encodeURIComponent(`Visit Type: ${visitType.replace('_', ' ')}\nContact: ${contactPerson}\nNotes: ${notes}`);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
    
    // Open in new tab
    window.open(googleCalendarUrl, '_blank');
  };

  const resetForm = () => {
    setCompanyName("");
    setContactPerson("");
    setContactEmail("");
    setVisitType("cold_call");
    setDurationMinutes("");
    setOutcome("");
    setNotes("");
    setLeadGenerated(false);
    setFollowUpRequired(false);
    setFollowUpDate("");
    setSendEmailReminder(false);
    setAddToCalendar(false);
    setDate(new Date());
    setTime("09:00");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isScheduled ? <CalendarIcon className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            {isScheduled ? "Schedule Visit" : "Log Visit"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="For reminders"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitType">Visit Type</Label>
              <Select value={visitType} onValueChange={(value) => setVisitType(value as typeof visitType)} required>
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

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Duration"
              />
            </div>
          </div>

          {isCompleted && (
            <>
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Textarea
                  id="outcome"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="What was the outcome of this visit?"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leadGenerated"
                  checked={leadGenerated}
                  onCheckedChange={checked => setLeadGenerated(checked === true)}
                />
                <Label htmlFor="leadGenerated">Lead generated from this visit</Label>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={followUpRequired}
                onCheckedChange={checked => setFollowUpRequired(checked === true)}
              />
              <Label htmlFor="followUpRequired">Follow-up required</Label>
            </div>
            
            {followUpRequired && (
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {isScheduled && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border">
              <h4 className="text-sm font-medium text-blue-900">Scheduling Options</h4>
              
              {contactEmail && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmailReminder"
                    checked={sendEmailReminder}
                    onCheckedChange={checked => setSendEmailReminder(checked === true)}
                  />
                  <Label htmlFor="sendEmailReminder" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send email reminder to contact
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addToCalendar"
                  checked={addToCalendar}
                  onCheckedChange={checked => setAddToCalendar(checked === true)}
                />
                <Label htmlFor="addToCalendar" className="flex items-center gap-2">
                  <CalendarIntegration className="h-4 w-4" />
                  Add to Google Calendar
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isScheduled ? "Schedule Visit" : "Log Visit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
