import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useCurrentUser, useLogout } from "../hooks/useAuth";
import { tokenManager } from "../utils/tokenManager";
import { AuthContext, type AuthContextType } from "./AuthContextDefinition";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: user, isLoading, error: userError } = useCurrentUser();
  const logoutMutation = useLogout();

  // Set up token manager event listeners
  useEffect(() => {
    const handleTokenExpired = () => {
      setError("Your session has expired. Please log in again.");
      navigate("/login", { replace: true });
    };

    const handleTokenCleared = () => {
      setError(null);
    };

    // Subscribe to token events
    tokenManager.subscribe({
      onTokenExpired: handleTokenExpired,
      onTokenCleared: handleTokenCleared,
    });

    // Cleanup on unmount
    return () => {
      tokenManager.unsubscribe();
    };
  }, [navigate]);

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
