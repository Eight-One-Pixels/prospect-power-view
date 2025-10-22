
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requireAuth = true, requiredRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate("/auth");
      } else if (!requireAuth && user) {
        navigate("/dashboard");
      } else if (user && requiredRoles && requiredRoles.length > 0) {
        // Check if user has required role
        if (!userRole || !requiredRoles.includes(userRole)) {
          navigate("/dashboard"); // Redirect to main dashboard if no permission
        }
      }
    }
  }, [user, userRole, loading, navigate, requireAuth, requiredRoles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  if (user && requiredRoles && requiredRoles.length > 0) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
