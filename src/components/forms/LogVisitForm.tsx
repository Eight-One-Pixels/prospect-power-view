
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

interface LogVisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogVisitForm = ({ open, onOpenChange }: LogVisitFormProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [visitType, setVisitType] = useState<"cold_call" | "follow_up" | "presentation" | "meeting" | "phone_call">("cold_call");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('daily_visits')
        .insert({
          rep_id: user.id,
          visit_date: format(date, 'yyyy-MM-dd'),
          company_name: companyName,
          contact_person: contactPerson,
          visit_type: visitType,
          notes
        });

      if (error) throw error;

      toast.success("Visit logged successfully!");
      onOpenChange(false);
      // Reset form
      setCompanyName("");
      setContactPerson("");
      setVisitType("cold_call");
      setNotes("");
      setDate(new Date());
    } catch (error) {
      console.error('Error logging visit:', error);
      toast.error("Failed to log visit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="companyName">Company Name</Label>
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
              {loading ? "Saving..." : "Log Visit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
