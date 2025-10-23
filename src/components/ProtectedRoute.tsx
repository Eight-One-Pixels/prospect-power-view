
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredEmail?: string;
}

const ProtectedRoute = ({ children, requireAuth = true, requiredRoles, requiredEmail }: ProtectedRouteProps) => {
  const { user, userRole, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate("/auth");
      } else if (!requireAuth && user) {
        navigate("/dashboard");
      } else if (user && requiredEmail) {
        // Check if user has required email
        if (!profile || profile.email !== requiredEmail) {
          navigate("/dashboard"); // Redirect to main dashboard if no permission
        }
      } else if (user && requiredRoles && requiredRoles.length > 0) {
        // Check if user has required role
        if (!userRole || !requiredRoles.includes(userRole)) {
          navigate("/dashboard"); // Redirect to main dashboard if no permission
        }
      }
    }
  }, [user, userRole, profile, loading, navigate, requireAuth, requiredRoles, requiredEmail]);

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

  if (user && requiredEmail) {
    if (!profile || profile.email !== requiredEmail) {
      return null;
    }
  }

  if (user && requiredRoles && requiredRoles.length > 0) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
