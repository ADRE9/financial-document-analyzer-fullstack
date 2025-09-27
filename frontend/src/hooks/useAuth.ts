// React Query hooks for authentication

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => apiClient.getCurrentUser(),
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserRegisterRequest) => apiClient.register(userData),
    onSuccess: (data) => {
      // Store tokens using token manager
      tokenManager.setTokens(data);
      // Invalidate user query to refetch with new token
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: UserLoginRequest) => apiClient.login(credentials),
    onSuccess: (data) => {
      // Store tokens using token manager
      tokenManager.setTokens(data);
      // Invalidate user query to refetch with new token
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
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
