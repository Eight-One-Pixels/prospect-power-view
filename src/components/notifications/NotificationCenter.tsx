
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, User, Building, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, isToday, isPast, addDays } from "date-fns";

export const NotificationCenter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);

  // Get visits that require follow-up today or are overdue
  const { data: followUpVisits } = useQuery({
    queryKey: ['follow-up-visits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_visits')
        .select('*')
        .eq('rep_id', user.id)
        .eq('follow_up_required', true)
        .lte('follow_up_date', addDays(new Date(), 1).toISOString().split('T')[0]) // Today and overdue
        .order('follow_up_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const markNotificationRead = useMutation({
    mutationFn: async (visitId: string) => {
      const { error } = await supabase
        .from('daily_visits')
        .update({ follow_up_required: false })
        .eq('id', visitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-visits'] });
      toast.success("Follow-up marked as completed");
    }
  });

  const getNotificationPriority = (followUpDate: string) => {
    const date = new Date(followUpDate);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    return 'upcoming';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'today': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const notificationCount = followUpVisits?.length || 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
            {notificationCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 top-12 z-50 w-80">
          <Card className="p-4 bg-white border shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Follow-up Reminders</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {notificationCount === 0 ? (
              <p className="text-gray-500 text-sm">No follow-ups due today</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {followUpVisits?.map((visit) => {
                  const priority = getNotificationPriority(visit.follow_up_date);
                  return (
                    <div
                      key={visit.id}
                      className={`p-3 rounded-lg border ${getPriorityColor(priority)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {visit.company_name}
                            </span>
                          </div>
                          
                          {visit.contact_person && (
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4" />
                              <span className="text-sm">{visit.contact_person}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              Follow-up: {format(new Date(visit.follow_up_date), 'MMM dd, yyyy')}
                            </span>
                          </div>

                          <Badge variant="outline" className="text-xs">
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markNotificationRead.mutate(visit.id)}
                          disabled={markNotificationRead.isPending}
                          className="ml-2"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
