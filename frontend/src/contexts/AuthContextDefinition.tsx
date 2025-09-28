import { createContext } from "react";
import type { UserResponse, UserRole } from "../types/api";

export interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  error: string | null;
  // Role checking methods
  isAdmin: boolean;
  isViewer: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAdminAccess: boolean;
  hasViewerAccess: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
