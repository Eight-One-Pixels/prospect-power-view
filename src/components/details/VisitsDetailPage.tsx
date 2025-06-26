import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Clock, User, Building, Edit, Trash2, Repeat } from "lucide-react";
import { AddLeadForm } from "@/components/forms/AddLeadForm";

interface VisitsDetailPageProps {
  onBack: () => void;
}

export const VisitsDetailPage = ({ onBack }: VisitsDetailPageProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

  // Edit form states
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editVisitType, setEditVisitType] = useState("");
  const [editDurationMinutes, setEditDurationMinutes] = useState("");
  const [editOutcome, setEditOutcome] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLeadGenerated, setEditLeadGenerated] = useState(false);
  const [editFollowUpRequired, setEditFollowUpRequired] = useState(false);
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [convertingVisit, setConvertingVisit] = useState<any>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInitialValues, setLeadInitialValues] = useState<any>(null);

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

  const handleConvertToLead = (visit: any) => {
    setConvertingVisit(visit);
    setLeadInitialValues({
      company_name: visit.company_name,
      contact_name: visit.contact_person,
      contact_email: visit.contact_email,
      contact_phone: visit.contact_phone,
      address: visit.address,
      notes: visit.notes,
      source: visit.source,
      estimated_revenue: visit.estimated_revenue ? String(visit.estimated_revenue) : "",
      currency: visit.currency || "USD",
      status: "new",
      date: visit.visit_date ? new Date(visit.visit_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
    });
    setShowLeadForm(true);
  };

  const handleLeadCreated = async () => {
    if (convertingVisit) {
      try {
        const { error } = await supabase
          .from('daily_visits')
          .update({ lead_generated: true })
          .eq('id', convertingVisit.id);

        if (error) throw error;
        toast.success("Visit converted to lead successfully!");
        setConvertingVisit(null);
        setShowLeadForm(false);
        // Optionally refetch visits here
      } catch (error) {
        console.error('Error updating visit:', error);
        toast.error("Failed to update visit status");
      }
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (visitId: string) => {
      const { error } = await supabase
        .from('daily_visits')
        .delete()
        .eq('id', visitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Visit deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['user-visits'] });
    },
    onError: (error) => {
      console.error('Error deleting visit:', error);
      toast.error("Failed to delete visit");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (visitData: any) => {
      const { error } = await supabase
        .from('daily_visits')
        .update({
          company_name: visitData.company_name,
          contact_person: visitData.contact_person,
          visit_type: visitData.visit_type,
          duration_minutes: visitData.duration_minutes ? parseInt(visitData.duration_minutes) : null,
          outcome: visitData.outcome,
          notes: visitData.notes,
          lead_generated: visitData.lead_generated,
          follow_up_required: visitData.follow_up_required,
          follow_up_date: visitData.follow_up_date || null
        })
        .eq('id', visitData.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Visit updated successfully!");
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['user-visits'] });
    },
    onError: (error) => {
      console.error('Error updating visit:', error);
      toast.error("Failed to update visit");
    }
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

  const handleEdit = (visit: any) => {
    setSelectedVisit(visit);
    setEditCompanyName(visit.company_name);
    setEditContactPerson(visit.contact_person || '');
    setEditVisitType(visit.visit_type);
    setEditDurationMinutes(visit.duration_minutes ? visit.duration_minutes.toString() : '');
    setEditOutcome(visit.outcome || '');
    setEditNotes(visit.notes || '');
    setEditLeadGenerated(visit.lead_generated || false);
    setEditFollowUpRequired(visit.follow_up_required || false);
    setEditFollowUpDate(visit.follow_up_date || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedVisit) return;

    updateMutation.mutate({
      id: selectedVisit.id,
      company_name: editCompanyName,
      contact_person: editContactPerson,
      visit_type: editVisitType,
      duration_minutes: editDurationMinutes,
      outcome: editOutcome,
      notes: editNotes,
      lead_generated: editLeadGenerated,
      follow_up_required: editFollowUpRequired,
      follow_up_date: editFollowUpDate
    });
  };

  const handleDelete = (visit: any) => {
    if (window.confirm(`Are you sure you want to delete the visit to ${visit.company_name}?`)) {
      deleteMutation.mutate(visit.id);
    }
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
          <Table className="min-w-[600px] w-full text-xs sm:text-sm md:text-base">
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
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(visit)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(visit)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                      {!visit.lead_generated && (
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full sm:w-auto text-xs sm:text-sm bg-black hover:bg-gray-900 text-white flex items-center gap-1"
                          onClick={() => handleConvertToLead(visit)}
                          title="Convert to Lead"
                        >
                          <Repeat className="h-4 w-4" />
                          To Lead
                        </Button>
                      )}
                    </div>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Visit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editCompanyName">Company Name</Label>
              <Input
                id="editCompanyName"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContactPerson">Contact Person</Label>
              <Input
                id="editContactPerson"
                value={editContactPerson}
                onChange={(e) => setEditContactPerson(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editVisitType">Visit Type</Label>
              <Select value={editVisitType} onValueChange={setEditVisitType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDurationMinutes">Duration (minutes)</Label>
              <Input
                id="editDurationMinutes"
                type="number"
                min="0"
                value={editDurationMinutes}
                onChange={(e) => setEditDurationMinutes(e.target.value)}
                placeholder="Duration in minutes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editOutcome">Outcome</Label>
              <Textarea
                id="editOutcome"
                value={editOutcome}
                onChange={(e) => setEditOutcome(e.target.value)}
                placeholder="What was the outcome of this visit?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="editLeadGenerated"
                checked={editLeadGenerated}
                onCheckedChange={checked => setEditLeadGenerated(checked === true)}
              />
              <Label htmlFor="editLeadGenerated">Lead generated from this visit</Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editFollowUpRequired"
                  checked={editFollowUpRequired}
                  onCheckedChange={checked => setEditFollowUpRequired(checked === true)}
                />
                <Label htmlFor="editFollowUpRequired">Follow-up required</Label>
              </div>
              
              {editFollowUpRequired && (
                <div className="space-y-2">
                  <Label htmlFor="editFollowUpDate">Follow-up Date</Label>
                  <Input
                    id="editFollowUpDate"
                    type="date"
                    value={editFollowUpDate}
                    onChange={(e) => setEditFollowUpDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Visit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {convertingVisit && (
        <AddLeadForm
          open={showLeadForm}
          onOpenChange={setShowLeadForm}
          onLeadCreated={handleLeadCreated}
          initialValues={leadInitialValues}
        />
      )}
    </div>
  );
};
