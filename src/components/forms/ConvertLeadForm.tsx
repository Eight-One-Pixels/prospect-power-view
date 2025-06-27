import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface ConvertLeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadData?: any;
  onConversionComplete?: () => void;
}

export const ConvertLeadForm = ({ 
  open, 
  onOpenChange, 
  leadId, 
  leadData, 
  onConversionComplete 
}: ConvertLeadFormProps) => {
  const { user } = useAuth();
  const [revenueAmount, setRevenueAmount] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");
  const [conversionDate, setConversionDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [commissionData, setCommissionData] = useState<any>(null);

  // Fetch deduction settings (global or for this user/team)
  const { data: deductionSettings, isLoading: deductionsLoading } = useReactQuery({
    queryKey: ['deduction-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deductions')
        .select('*'); // fetch all deductions as array
      if (error) throw error;
      return data;
    },
    enabled: open
  });

  // Fetch commission calculation when revenue or rate changes
  const { data: calculationResult, refetch: recalculate } = useReactQuery({
    queryKey: ['commission-calculation', revenueAmount, commissionRate, deductionSettings],
    queryFn: async () => {
      if (!revenueAmount || !commissionRate || !Number.isFinite(parseFloat(revenueAmount)) || !Number.isFinite(parseFloat(commissionRate))) return null;
      // Pass deduction settings if your RPC supports it, else just display
      const { data, error } = await supabase
        .rpc('calculate_commission_with_deductions', {
          revenue_amount: parseFloat(revenueAmount),
          commission_rate: parseFloat(commissionRate),
          currency: leadData?.currency || 'USD',
          deduction_settings: deductionSettings ?? null
        });
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!revenueAmount && !!commissionRate && Number.isFinite(parseFloat(revenueAmount)) && Number.isFinite(parseFloat(commissionRate)) && parseFloat(revenueAmount) > 0 && !!deductionSettings
  });

  // Fetch user's default commission rate
  useReactQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('default_commission_rate')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id && open,
    onSuccess: (data) => {
      if (data?.default_commission_rate !== undefined && data?.default_commission_rate !== null) {
        setCommissionRate(String(data.default_commission_rate));
      }
    }
  });

  useEffect(() => {
    if (calculationResult) {
      setCommissionData(calculationResult);
    }
  }, [calculationResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !leadId) return;

    setLoading(true);
    try {
      const conversionData = {
        lead_id: leadId,
        rep_id: user.id,
        revenue_amount: parseFloat(revenueAmount),
        commission_rate: parseFloat(commissionRate),
        commission_amount: commissionData?.final_commission || 0,
        commissionable_amount: commissionData?.commissionable_amount || parseFloat(revenueAmount),
        deductions_applied: commissionData?.deductions_applied || [],
        conversion_date: conversionDate,
        currency: leadData?.currency || 'USD',
        notes
      };

      const { error } = await supabase
        .from('conversions')
        .insert(conversionData);

      if (error) throw error;

      // Update lead status to closed_won
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'closed_won' })
        .eq('id', leadId);

      if (leadError) throw leadError;

      toast.success('Lead converted successfully!');
      onOpenChange(false);
      if (onConversionComplete) onConversionComplete();
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error converting lead:', error);
      toast.error('Failed to convert lead');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRevenueAmount("");
    setCommissionRate("10");
    setConversionDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setCommissionData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Lead to Sale</DialogTitle>
        </DialogHeader>
        
        {leadData && (
          <Card className="p-4 bg-gray-50">
            <div className="space-y-2">
              <h4 className="font-medium">{leadData.company_name}</h4>
              <p className="text-sm text-gray-600">Contact: {leadData.contact_name}</p>
              <p className="text-sm text-gray-600">
                Estimated Revenue: {leadData.currency} {leadData.estimated_revenue || 0}
              </p>
            </div>
          </Card>
        )}

        
        {deductionSettings && Array.isArray(deductionSettings) && (
          <Card className="p-4 bg-yellow-50 mb-2">
            <h4 className="font-medium mb-2">Deductions</h4>
            {deductionSettings.length > 0 ? (
              <ul className="list-disc ml-5 text-sm">
                {deductionSettings.map((d: any, idx: number) => (
                  <li key={idx} className="mb-1">
                    <span className="font-semibold">{d.label}</span>: {d.percentage}%
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500 text-sm">No deductions configured.</span>
            )}
          </Card>
        )}
        

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenueAmount">Actual Revenue Amount *</Label>
              <Input
                id="revenueAmount"
                type="number"
                step="0.01"
                min="0"
                value={revenueAmount}
                onChange={(e) => setRevenueAmount(e.target.value)}
                required
                placeholder="0.00"
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
                required
              />
            </div>
          </div>

          {commissionData && (
            <Card className="p-4 bg-blue-50">
              <h4 className="font-medium mb-3">Commission Calculation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Revenue Amount:</span>
                  <span className="font-medium">{leadData?.currency || 'USD'} {parseFloat(revenueAmount).toFixed(2)}</span>
                </div>
                
                {commissionData.deductions_applied && commissionData.deductions_applied.length > 0 && (
                  <>
                    <div className="border-t pt-2">
                      <span className="font-medium text-gray-700">Deductions Applied:</span>
                    </div>
                    {commissionData.deductions_applied.map((deduction: any, index: number) => (
                      <div key={index} className="flex justify-between text-gray-600 ml-2">
                        <span>{deduction.label} ({deduction.percentage}%):</span>
                        <span>
                          -{leadData?.currency || 'USD'} {Number.isFinite(Number(deduction.amount)) ? Number(deduction.amount).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    ))}
                  </>
                )}
                
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Commissionable Amount:</span>
                  <span className="font-medium text-green-600">
                    {leadData?.currency || 'USD'} {parseFloat(commissionData.commissionable_amount).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Final Commission ({commissionRate}%):</span>
                  <Badge className="bg-green-100 text-green-800">
                    {leadData?.currency || 'USD'} {parseFloat(commissionData.final_commission).toFixed(2)}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="conversionDate">Conversion Date</Label>
            <Input
              id="conversionDate"
              type="date"
              value={conversionDate}
              onChange={(e) => setConversionDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this conversion..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !commissionData}>
              {loading ? "Converting..." : "Convert Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
