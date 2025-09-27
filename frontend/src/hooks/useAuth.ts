// Enhanced React Query hooks for robust authentication

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { apiClient } from "../services/api";
import { tokenManager } from "../utils/tokenManager";
import type {
  UserRegisterRequest,
  UserLoginRequest,
  UserUpdateRequest,
  PasswordChangeRequest,
  LogoutRequest,
} from "../types/api";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  sessions: () => [...authKeys.all, "sessions"] as const,
};

// Enhanced error handler for auth failures
const handleAuthError = (
  error: any,
  queryClient: QueryClient,
  navigate?: ReturnType<typeof useNavigate>
) => {
  if (error?.status === 401 || error?.response?.status === 401) {
    // Token is invalid, clear auth state
    tokenManager.clearTokens();
    queryClient.removeQueries({ queryKey: authKeys.user() });

    if (navigate) {
      navigate("/login", { replace: true });
    }

    toast.error("Session expired. Please log in again.");
  }
};

// Get current user with robust error handling
export const useCurrentUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      try {
        // Check if token needs refresh before making request
        if (tokenManager.needsRefresh()) {
          await tokenManager.refreshAccessToken();
        }
        return await apiClient.getCurrentUser();
      } catch (error) {
        handleAuthError(error, queryClient, navigate);
        throw error;
      }
    },
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.response?.status === 401) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Get user sessions
export const useUserSessions = () => {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => apiClient.getUserSessions(),
    enabled: tokenManager.isAuthenticated(),
  });
};

// Enhanced register mutation with optimistic updates and robust error handling
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UserRegisterRequest) => {
      // Show optimistic loading state
      toast.loading("Creating your account...", { id: "register" });
      return await apiClient.register(userData);
    },
    onSuccess: async (data) => {
      try {
        // Store tokens using token manager
        tokenManager.setTokens(data);

        // Optimistically set the user data
        queryClient.setQueryData(authKeys.user(), data.user);

        // Ensure the user query is properly cached
        await queryClient.ensureQueryData({
          queryKey: authKeys.user(),
          queryFn: () => apiClient.getCurrentUser(),
        });

        toast.success("Registration successful! Welcome aboard!", {
          id: "register",
        });
      } catch (error) {
        console.error("Post-registration setup failed:", error);
        toast.error(
          "Registration completed but there was an issue. Please try logging in.",
          { id: "register" }
        );
      }
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);

      let errorMessage = "Registration failed. Please try again.";

      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: "register" });
    },
    // Add retry logic for network failures
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry server errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};

// Enhanced login mutation with optimistic updates and robust error handling
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: UserLoginRequest) => {
      // Show optimistic loading state
      toast.loading("Signing you in...", { id: "login" });
      return await apiClient.login(credentials);
    },
    onSuccess: async (data) => {
      try {
        // Store tokens using token manager
        tokenManager.setTokens(data);

        // Optimistically set the user data
        queryClient.setQueryData(authKeys.user(), data.user);

        // Ensure the user query is properly cached
        await queryClient.ensureQueryData({
          queryKey: authKeys.user(),
          queryFn: () => apiClient.getCurrentUser(),
        });

        toast.success("Welcome back!", { id: "login" });
      } catch (error) {
        console.error("Post-login setup failed:", error);
        toast.error(
          "Login completed but there was an issue. Please refresh the page.",
          { id: "login" }
        );
      }
    },
    onError: (error: any) => {
      console.error("Login failed:", error);

      let errorMessage = "Invalid email or password.";

      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.status === 401) {
        errorMessage = "Invalid email or password.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: "login" });
    },
    // Add retry logic for network failures
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry server errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logoutData: LogoutRequest = {}) =>
      apiClient.logout(logoutData),
    onSuccess: () => {
      // Clear tokens using token manager
      tokenManager.clearTokens();
      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Clear tokens even on error
      tokenManager.clearTokens();
      queryClient.clear();
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserUpdateRequest) => apiClient.updateUser(userData),
    onSuccess: () => {
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData: PasswordChangeRequest) =>
      apiClient.changePassword(passwordData),
    onError: (error) => {
      console.error("Password change failed:", error);
    },
  });
};

// Revoke session mutation
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => apiClient.revokeSession(sessionId),
    onSuccess: () => {
      // Invalidate sessions query to refetch updated list
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
    },
    onError: (error) => {
      console.error("Session revocation failed:", error);
    },
  });
};
