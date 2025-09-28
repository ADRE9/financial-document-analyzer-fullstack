import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuthContext";
import { UserRole } from "../types/api";

/**
 * Smart home component that redirects users to their appropriate role-based home page
 */
const SmartHome = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for auth to load
    }

    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }

    // Route based on user role
    switch (user.role) {
      case UserRole.ADMIN:
        navigate("/admin", { replace: true });
        break;
      case UserRole.VIEWER:
        navigate("/viewer", { replace: true });
        break;
      default:
        // Fallback for unknown roles
        navigate("/viewer", { replace: true });
        break;
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  // Show loading while determining where to redirect
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // This component should redirect, so we don't render anything meaningful
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default SmartHome;
