import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuthContext";
import { UserRole } from "../types/api";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * Component to protect routes based on user roles
 */
export const RoleBasedRoute = ({
  children,
  allowedRoles,
  fallbackPath = "/unauthorized",
}: RoleBasedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

interface AdminRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * Component to protect admin-only routes
 */
export const AdminRoute = ({
  children,
  fallbackPath = "/home",
}: AdminRouteProps) => {
  return (
    <RoleBasedRoute allowedRoles={[UserRole.ADMIN]} fallbackPath={fallbackPath}>
      {children}
    </RoleBasedRoute>
  );
};

interface ViewerRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * Component to protect viewer+ routes (viewer or admin)
 */
export const ViewerRoute = ({
  children,
  fallbackPath = "/unauthorized",
}: ViewerRouteProps) => {
  return (
    <RoleBasedRoute
      allowedRoles={[UserRole.VIEWER, UserRole.ADMIN]}
      fallbackPath={fallbackPath}
    >
      {children}
    </RoleBasedRoute>
  );
};
