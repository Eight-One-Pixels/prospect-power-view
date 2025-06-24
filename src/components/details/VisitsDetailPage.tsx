
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Clock, User, Building } from "lucide-react";

interface VisitsDetailPageProps {
  onBack: () => void;
}

export const VisitsDetailPage = ({ onBack }: VisitsDetailPageProps) => {
  const { user } = useAuth();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['user-visits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('daily_visits')
        .select('*')
        .eq('rep_id', user.id)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const getVisitTypeColor = (type: string) => {
    const colors = {
      cold_call: "bg-blue-100 text-blue-800",
      follow_up: "bg-green-100 text-green-800",
      presentation: "bg-purple-100 text-purple-800",
      meeting: "bg-orange-100 text-orange-800",
      phone_call: "bg-yellow-100 text-yellow-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">All Visits</h1>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Lead Generated</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Follow-up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits?.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      {visit.company_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      {visit.contact_person || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getVisitTypeColor(visit.visit_type)}>
                      {visit.visit_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {visit.duration_minutes ? `${visit.duration_minutes} min` : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={visit.lead_generated ? "default" : "secondary"}>
                      {visit.lead_generated ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {visit.outcome || 'No outcome recorded'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {visit.follow_up_required ? (
                      <div>
                        <Badge variant="outline" className="mb-1">Required</Badge>
                        {visit.follow_up_date && (
                          <p className="text-xs text-gray-600">
                            {new Date(visit.follow_up_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary">Not Required</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {visits?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No visits recorded yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
