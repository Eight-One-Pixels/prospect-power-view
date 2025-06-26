
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Mail, Phone, Building, Calendar } from "lucide-react";

export const ProfileSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setDepartment(profile.department || "");
      setPosition(profile.position || "");
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const updatePassword = useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success('Password updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update password');
    }
  });

  const handleProfileUpdate = () => {
    updateProfile.mutate({
      full_name: fullName,
      phone: phone,
      department: department,
      position: position
    });
  };

  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    updatePassword.mutate({ newPassword });
  };

  if (isLoading) return <div>Loading profile...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/70 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl font-semibold">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-lg">{profile?.full_name || 'User'}</h4>
            <p className="text-sm text-gray-600">{profile?.position || 'Sales Representative'}</p>
            {profile?.hire_date && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                Joined {new Date(profile.hire_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                value={email}
                disabled
                className="pl-10 bg-gray-50"
                placeholder="Email cannot be changed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="pl-10"
                placeholder="Enter your department"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Enter your job title"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleProfileUpdate} disabled={updateProfile.isPending}>
            Update Profile
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-white/70 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <Button 
            onClick={handlePasswordUpdate} 
            disabled={updatePassword.isPending || !newPassword || !confirmPassword}
            className="w-full"
          >
            Update Password
          </Button>
        </div>
      </Card>
    </div>
  );
};
