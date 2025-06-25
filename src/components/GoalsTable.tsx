
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { SetGoalsForm } from "./forms/SetGoalsForm";
import { toast } from "sonner";
import { format } from "date-fns";

export const GoalsTable = () => {
  const { user, userRole } = useAuth();
  const queryClient = useQueryClient();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', user?.id, userRole],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('goals')
        .select('*');

      // Filter by user if not manager/admin
      if (!['manager', 'director', 'admin'].includes(userRole || '')) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  const handleDelete = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      toast.success("Goal deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error("Failed to delete goal");
    }
  };

  const handleGoalUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] });
    setEditingGoal(null);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading goals...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Goals Management</h3>
        <Button onClick={() => setShowGoalForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals?.map((goal) => (
              <TableRow key={goal.id}>
                <TableCell className="font-medium capitalize">{goal.goal_type}</TableCell>
                <TableCell>
                  {goal.goal_type === 'revenue' ? (
                    `${goal.currency || 'USD'} ${Number(goal.target_value).toLocaleString()}`
                  ) : (
                    Number(goal.target_value).toLocaleString()
                  )}
                </TableCell>
                <TableCell>
                  {goal.goal_type === 'revenue' ? (
                    `${goal.currency || 'USD'} ${Number(goal.current_value || 0).toLocaleString()}`
                  ) : (
                    Number(goal.current_value || 0).toLocaleString()
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(Number(goal.current_value) || 0, Number(goal.target_value))}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {getProgressPercentage(Number(goal.current_value) || 0, Number(goal.target_value)).toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(goal.period_start), 'MMM dd')}</div>
                    <div className="text-gray-500">to {format(new Date(goal.period_end), 'MMM dd')}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">{goal.description || 'No description'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {goals?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No goals set yet. Click "Add Goal" to create your first goal.
        </div>
      )}

      <SetGoalsForm
        open={showGoalForm}
        onOpenChange={(open) => {
          setShowGoalForm(open);
          if (!open) setEditingGoal(null);
        }}
        goal={editingGoal}
        onGoalUpdated={handleGoalUpdated}
      />
    </Card>
  );
};
