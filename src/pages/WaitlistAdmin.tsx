import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Users, 
  Mail, 
  Search, 
  Filter,
  TrendingUp,
  Award,
  Send,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";

interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  team_size: string | null;
  referral_code: string;
  position: number | null;
  status: string;
  referral_count: number;
  created_at: string;
  invited_at: string | null;
}

interface WaitlistStats {
  total_waiting: number;
  total_invited: number;
  total_signed_up: number;
  total_referrals: number;
  avg_referrals_per_user: number;
}

export default function WaitlistAdmin() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"position" | "referrals" | "date">("position");

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const fetchWaitlistData = async () => {
    setLoading(true);
    try {
      // Fetch waitlist entries
      const { data: entriesData, error: entriesError } = await (supabase.from as any)("waitlist")
        .select("*")
        .order("position", { ascending: true });

      if (entriesError) throw entriesError;
      setEntries(entriesData || []);

      // Fetch stats
      const { data: statsData, error: statsError } = await (supabase.rpc as any)(
        "get_waitlist_stats"
      );

      if (statsError) throw statsError;
      setStats(statsData);
    } catch (error: any) {
      console.error("Error fetching waitlist data:", error);
      toast.error("Failed to load waitlist data");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "invited" && !entries.find(e => e.id === id)?.invited_at) {
        updateData.invited_at = new Date().toISOString();
      }

      const { error } = await (supabase.from as any)("waitlist")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      fetchWaitlistData();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const sendInviteEmail = async (entry: WaitlistEntry) => {
    try {
      // Update status first
      await updateStatus(entry.id, "invited");

      // Send email via edge function
      const response = await fetch(
        "https://xfaeneifadmdtebvxltq.supabase.co/functions/v1/send-waitlist-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYWVuZWlmYWRtZHRlYnZ4bHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODA3MDgsImV4cCI6MjA2NTY1NjcwOH0.GcOvWJWQktQhaTUVoWtQ7qXPxVqtnBeAeIj9RhLscdo`,
          },
          body: JSON.stringify({
            event: "instant_access",
            data: {
              email: entry.email,
              full_name: entry.full_name,
              position: entry.position,
              referral_code: entry.referral_code,
              referral_count: entry.referral_count,
            },
          }),
        }
      );

      if (response.ok) {
        toast.success("Invite email sent successfully!");
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invite email");
    }
  };

  const filteredEntries = entries
    .filter((entry) => {
      const matchesSearch =
        entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.company_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "position":
          return (a.position || 999999) - (b.position || 999999);
        case "referrals":
          return b.referral_count - a.referral_count;
        case "date":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  if (!profile || profile.email !== 'alo@eiteone.org') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Waitlist Management</h1>
          <p className="text-gray-600">Manage waitlist entries, track referrals, and send invites</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Waiting</p>
                  <p className="text-2xl font-bold">{stats.total_waiting}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Invited</p>
                  <p className="text-2xl font-bold">{stats.total_invited}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Signed Up</p>
                  <p className="text-2xl font-bold">{stats.total_signed_up}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold">{stats.total_referrals}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="signed_up">Signed Up</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="position">Position</SelectItem>
                <SelectItem value="referrals">Referrals</SelectItem>
                <SelectItem value="date">Date Joined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Waitlist Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge variant="outline">#{entry.position || "—"}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.full_name}</TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell>{entry.company_name || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-500" />
                          <span className="font-semibold">{entry.referral_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.status === "waiting"
                              ? "secondary"
                              : entry.status === "invited"
                              ? "default"
                              : entry.status === "signed_up"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            entry.status === "waiting"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : entry.status === "invited"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : entry.status === "signed_up"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : ""
                          }
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.status === "waiting" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendInviteEmail(entry)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Invite
                              </Button>
                              <Select
                                value={entry.status}
                                onValueChange={(v) => updateStatus(entry.id, v)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="waiting">Waiting</SelectItem>
                                  <SelectItem value="invited">Invited</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          )}
                          {entry.status === "invited" && (
                            <Select
                              value={entry.status}
                              onValueChange={(v) => updateStatus(entry.id, v)}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="invited">Invited</SelectItem>
                                <SelectItem value="signed_up">Signed Up</SelectItem>
                                <SelectItem value="waiting">Waiting</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
