import { UserRole, type UserResponse } from "../types/api";

/**
 * Utility functions for role-based access control in the frontend
 */

/**
 * Check if a user has admin role
 */
export const isAdmin = (user: UserResponse | null): boolean => {
  return user?.role === UserRole.ADMIN;
};

/**
 * Check if a user has viewer role
 */
export const isViewer = (user: UserResponse | null): boolean => {
  return user?.role === UserRole.VIEWER;
};

/**
 * Check if a user has a specific role
 */
export const hasRole = (user: UserResponse | null, role: UserRole): boolean => {
  return user?.role === role;
};

/**
 * Check if a user has viewer access or higher (viewer or admin)
 */
export const hasViewerAccess = (user: UserResponse | null): boolean => {
  return user?.role === UserRole.VIEWER || user?.role === UserRole.ADMIN;
};

/**
 * Check if a user has admin access
 */
export const hasAdminAccess = (user: UserResponse | null): boolean => {
  return user?.role === UserRole.ADMIN;
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrator";
    case UserRole.VIEWER:
      return "Viewer";
    default:
      return "Unknown";
  }
};

/**
 * Get role badge color class for UI
 */
export const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "bg-red-100 text-red-800";
    case UserRole.VIEWER:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
