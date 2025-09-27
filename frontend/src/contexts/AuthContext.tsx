import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useCurrentUser, useLogout } from "../hooks/useAuth";
import { tokenManager } from "../utils/tokenManager";
import { AuthContext, type AuthContextType } from "./AuthContextDefinition";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [error, setError] = useState<string | null>(null);
  const { data: user, isLoading, error: userError } = useCurrentUser();
  const logoutMutation = useLogout();

  // Clear error when user changes
  useEffect(() => {
    if (user) {
      setError(null);
    }
  }, [user]);

  // Set error from user query
  useEffect(() => {
    if (userError) {
      setError(userError.message);
    }
  }, [userError]);

  const logout = () => {
    logoutMutation.mutate({});
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: tokenManager.isAuthenticated() && !!user,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
