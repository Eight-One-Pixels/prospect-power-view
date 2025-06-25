
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

interface SetGoalsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: any;
  onGoalUpdated?: () => void;
}

export const SetGoalsForm = ({ open, onOpenChange, goal, onGoalUpdated }: SetGoalsFormProps) => {
  const { user } = useAuth();
  const [goalType, setGoalType] = useState(goal?.goal_type || "");
  const [targetValue, setTargetValue] = useState(goal?.target_value?.toString() || "");
  const [currency, setCurrency] = useState(goal?.currency || "USD");
  const [periodStart, setPeriodStart] = useState<Date>(goal?.period_start ? new Date(goal.period_start) : new Date());
  const [periodEnd, setPeriodEnd] = useState<Date>(goal?.period_end ? new Date(goal.period_end) : new Date());
  const [description, setDescription] = useState(goal?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const goalData: any = {
        user_id: user.id,
        goal_type: goalType,
        target_value: parseFloat(targetValue),
        current_value: goal?.current_value || 0,
        period_start: format(periodStart, 'yyyy-MM-dd'),
        period_end: format(periodEnd, 'yyyy-MM-dd'),
        description
      };

      // Add currency for revenue goals
      if (goalType === 'revenue') {
        goalData.currency = currency;
      }

      if (goal?.id) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', goal.id);
        if (error) throw error;
        toast.success("Goal updated successfully!");
      } else {
        // Create new goal
        const { error } = await supabase
          .from('goals')
          .insert(goalData);
        if (error) throw error;
        toast.success("Goal set successfully!");
      }

      onGoalUpdated?.();
      onOpenChange(false);
      // Reset form
      setGoalType("");
      setTargetValue("");
      setCurrency("USD");
      setDescription("");
      setPeriodStart(new Date());
      setPeriodEnd(new Date());
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error("Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'GHS', name: 'Ghanaian Cedi' },
    { code: 'EGP', name: 'Egyptian Pound' },
    { code: 'MAD', name: 'Moroccan Dirham' },
    { code: 'TND', name: 'Tunisian Dinar' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'QAR', name: 'Qatari Riyal' },
    { code: 'MWK', name: 'Malawi Kwacha' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Set New Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalType">Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value="visits">Visits</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="conversions">Conversions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetValue">Target Value</Label>
            <Input
              id="targetValue"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              required
            />
          </div>

          {goalType === 'revenue' && (
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto">
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(periodStart, "MMM dd")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={periodStart}
                    onSelect={(date) => date && setPeriodStart(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Period End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(periodEnd, "MMM dd")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={periodEnd}
                    onSelect={(date) => date && setPeriodEnd(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : goal ? "Update Goal" : "Set Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
