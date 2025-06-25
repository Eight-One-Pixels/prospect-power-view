import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Edit, Users, Shield } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'rep' | 'manager' | 'director' | 'admin' | null;
  is_active: boolean | null;
  created_at: string | null;
}

const ManageUsers = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      navigate('/');
      toast.error("Access denied. Admin privileges required.");
    }
  }, [userRole, navigate]);

  useEffect(() => {
    if (userRole === 'admin') {
      loadUsers();
    }
  }, [userRole]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_with_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async () => {
    if (!editingUser || !newRole) return;

    setUpdating(true);
    try {
      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: editingUser.id,
          role: newRole as any
        }, { onConflict: 'user_id' });

      if (roleError) throw roleError;

      toast.success("User role updated successfully!");
      setEditingUser(null);
      setNewRole("");
      loadUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error("Failed to update user role");
    } finally {
      setUpdating(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No user updated');

      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully!`);
      loadUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error("Failed to update user status");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'director':
        return 'default';
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (userRole !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <p className="text-sm text-gray-500 cursor-pointer" onClick={() => navigate("/")}>← Back to Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 mt-2 md:mt-0">
            Manage Users
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>

        <Card className="p-2 sm:p-4 md:p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
              <h2 className="text-lg md:text-xl font-bold text-gray-900">All Users</h2>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 text-xs md:text-sm">
              <Shield className="h-3 w-3" />
              Admin Access
            </Badge>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="p-3 sm:p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-row items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold">
                      {user.full_name 
                        ? getInitials(user.full_name)
                        : user.email ? getInitials(user.email) : 'U'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-xs md:max-w-sm">
                      {user.full_name || user.email}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 truncate max-w-[140px] sm:max-w-xs md:max-w-sm">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-xs md:max-w-sm">{user.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize text-xs md:text-sm">
                    {user.role || 'No Role'}
                  </Badge>
                  <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-xs md:text-sm">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setNewRole(user.role || '');
                        }}
                        className="px-2 py-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>User</Label>
                          <p className="text-sm text-gray-600">{editingUser?.full_name || editingUser?.email}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rep">Rep</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="director">Director</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={updateUserRole} disabled={updating} className="w-full">
                          {updating ? "Updating..." : "Update Role"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant={user.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleUserStatus(user.id, user.is_active || false)}
                    className="px-2 py-1"
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManageUsers;
