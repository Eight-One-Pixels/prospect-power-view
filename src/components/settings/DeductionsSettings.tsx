
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Deduction {
  id: string;
  label: string;
  percentage: number;
  applies_before_commission: boolean;
  is_active: boolean;
}

export const DeductionsSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<Deduction | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    percentage: "",
    applies_before_commission: true
  });

  const { data: deductions, isLoading } = useQuery({
    queryKey: ['deductions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deductions')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const createDeduction = useMutation({
    mutationFn: async (deductionData: any) => {
      const { data, error } = await supabase
        .from('deductions')
        .insert({
          ...deductionData,
          created_by: user?.id
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
      toast.success('Deduction added successfully');
      resetForm();
      setShowAddForm(false);
    },
    onError: () => {
      toast.error('Failed to add deduction');
    }
  });

  const updateDeduction = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('deductions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
      toast.success('Deduction updated successfully');
      setEditingDeduction(null);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update deduction');
    }
  });

  const toggleDeduction = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('deductions')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
      toast.success('Deduction updated');
    }
  });

  const resetForm = () => {
    setFormData({
      label: "",
      percentage: "",
      applies_before_commission: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      label: formData.label,
      percentage: parseFloat(formData.percentage),
      applies_before_commission: formData.applies_before_commission
    };

    if (editingDeduction) {
      updateDeduction.mutate({ id: editingDeduction.id, ...data });
    } else {
      createDeduction.mutate(data);
    }
  };

  const startEdit = (deduction: Deduction) => {
    setEditingDeduction(deduction);
    setFormData({
      label: deduction.label,
      percentage: deduction.percentage.toString(),
      applies_before_commission: deduction.applies_before_commission
    });
    setShowAddForm(true);
  };

  if (isLoading) {
    return <div className="p-4">Loading deductions...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Tax & Levy Deductions</h3>
          <p className="text-sm text-gray-600">Configure deductions that affect commission calculations</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={(open) => {
          setShowAddForm(open);
          if (!open) {
            setEditingDeduction(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Deduction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDeduction ? 'Edit Deduction' : 'Add New Deduction'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., VAT, Income Tax, Levy"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Percentage *</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                  placeholder="15.00"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="applies_before"
                  checked={formData.applies_before_commission}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, applies_before_commission: checked }))
                  }
                />
                <Label htmlFor="applies_before">Apply before commission calculation</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDeduction.isPending || updateDeduction.isPending}>
                  {editingDeduction ? 'Update' : 'Add'} Deduction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {deductions?.map((deduction: Deduction) => (
          <div key={deduction.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{deduction.label}</h4>
                <Badge variant={deduction.is_active ? "default" : "secondary"}>
                  {deduction.percentage}%
                </Badge>
                {deduction.applies_before_commission && (
                  <Badge variant="outline" className="text-xs">
                    Pre-commission
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={deduction.is_active}
                onCheckedChange={(checked) => 
                  toggleDeduction.mutate({ id: deduction.id, is_active: checked })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit(deduction)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {deductions?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No deductions configured. Add your first deduction to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
