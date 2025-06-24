
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { BarChart3, Users, Settings, LogOut, User, Home, FileText } from "lucide-react";

export const Navigation = () => {
  const { user, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isManager = userRole && ['manager', 'director', 'admin'].includes(userRole);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Alo-Sales
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/") 
                    ? "bg-indigo-100 text-indigo-700" 
                    : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
                }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              
              <Link
                to="/reports"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/reports") 
                    ? "bg-indigo-100 text-indigo-700" 
                    : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
                }`}
              >
                <FileText className="h-4 w-4" />
                Reports
              </Link>

              {isManager && (
                <Link
                  to="/manage-users"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive("/manage-users") 
                      ? "bg-indigo-100 text-indigo-700" 
                      : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Manage Users
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {userRole && (
              <Badge variant="outline" className="hidden sm:inline-flex">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
