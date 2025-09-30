// Enhanced React Query hooks for robust authentication

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  getCurrentUser,
  getUserSessions,
  register,
  login,
  logout,
  updateUser,
  changePassword,
  revokeSession,
} from "../services/api";
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
  error: unknown,
  queryClient: QueryClient,
  navigate?: ReturnType<typeof useNavigate>
) => {
  const err = error as { status?: number; response?: { status?: number } };
  if (err?.status === 401 || err?.response?.status === 401) {
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
        return await getCurrentUser();
      } catch (error) {
        handleAuthError(error, queryClient, navigate);
        throw error;
      }
    },
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      const err = error as { status?: number; response?: { status?: number } };
      // Don't retry on auth errors
      if (err?.status === 401 || err?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Get user sessions
export const useUserSessions = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: async () => {
      try {
        return await getUserSessions();
      } catch (error) {
        handleAuthError(error, queryClient, navigate);
        throw error;
      }
    },
    enabled: tokenManager.isAuthenticated(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Register with optimistic user fetch
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (userData: UserRegisterRequest) => {
      const result = await register(userData);

      // Store tokens
      tokenManager.setTokens({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
        token_type: result.token_type,
      });

      // Fetch user data immediately
      const user = await getCurrentUser();

      return { ...result, user };
    },
    onSuccess: (data) => {
      // Set user in cache
      queryClient.setQueryData(authKeys.user(), data.user);

      toast.success("Account created successfully!");

      // Navigate based on user role
      const userRole = data.user.role?.toLowerCase();
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "viewer") {
        navigate("/viewer", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    },
    onError: (error: Error) => {
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    },
  });
};

// Login with session initialization
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: UserLoginRequest) => {
      const result = await login(credentials);

      // Store tokens
      tokenManager.setTokens({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
        token_type: result.token_type,
      });

      // Fetch user data immediately
      const user = await getCurrentUser();

      return { ...result, user };
    },
    onSuccess: (data) => {
      // Set user in cache
      queryClient.setQueryData(authKeys.user(), data.user);

      toast.success(`Welcome back, ${data.user.username}!`);

      // Navigate based on user role
      const userRole = data.user.role?.toLowerCase();
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "viewer") {
        navigate("/viewer", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    },
    onError: (error: Error) => {
      const errorMessage =
        error.message ||
        "Login failed. Please check your credentials and try again.";
      toast.error(errorMessage);
    },
  });
};

// Logout with cleanup
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (logoutData: LogoutRequest = {}) => {
      try {
        await logout(logoutData);
      } catch (error) {
        // Continue with logout even if API call fails
        console.error("Logout API call failed:", error);
      }
    },
    onSuccess: () => {
      // Clear tokens
      tokenManager.clearTokens();

      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.user() });
      queryClient.removeQueries({ queryKey: authKeys.sessions() });

      // Clear all cached data
      queryClient.clear();

      toast.success("Logged out successfully");

      // Navigate to login
      navigate("/login", { replace: true });
    },
  });
};

// Update user profile
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UserUpdateRequest) => updateUser(userData),
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(authKeys.user(), updatedUser);

      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      const errorMessage =
        error.message || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    },
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: PasswordChangeRequest) =>
      await changePassword(passwordData),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: Error) => {
      const errorMessage =
        error.message || "Failed to change password. Please try again.";
      toast.error(errorMessage);
    },
  });
};

// Revoke session
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => revokeSession(sessionId),
    onSuccess: () => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });

      toast.success("Session revoked successfully!");
    },
    onError: (error: Error) => {
      const errorMessage =
        error.message || "Failed to revoke session. Please try again.";
      toast.error(errorMessage);
    },
  });
};
