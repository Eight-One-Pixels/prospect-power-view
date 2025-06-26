import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const DetailedUsersTable = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles_with_roles')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load users.</div>;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-6 pb-2">
        <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl">All Users</DialogTitle>
        </DialogHeader>
        <span className="text-gray-500 text-sm">Total: {users.length}</span>
      </div>
      <div className="overflow-x-auto px-2 pb-6">
        <Table className="min-w-[700px] w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium max-w-[180px] truncate">{user.full_name || user.email}</TableCell>
                <TableCell className="max-w-[200px] truncate">{user.email}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{user.role}</Badge></TableCell>
                <TableCell>{user.is_active ? <span className="text-green-600">Active</span> : <span className="text-gray-400">Inactive</span>}</TableCell>
                <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export const DetailedUsersTableDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl w-full p-0">
      <div className="p-0">
        <DetailedUsersTable />
      </div>
    </DialogContent>
  </Dialog>
);
