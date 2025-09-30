import { apiClient } from "./client";
import type {
  UserRegisterRequest,
  UserLoginRequest,
  TokenResponse,
  UserResponse,
  UserUpdateRequest,
  PasswordChangeRequest,
  LogoutRequest,
  SuccessResponse,
  UserSessionsResponse,
} from "../../types/api";

export const register = (
  userData: UserRegisterRequest
): Promise<TokenResponse> => {
  return apiClient.request<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const login = (
  credentials: UserLoginRequest
): Promise<TokenResponse> => {
  return apiClient.request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const logout = (
  logoutData: LogoutRequest = {}
): Promise<SuccessResponse> => {
  return apiClient.request<SuccessResponse>("/auth/logout", {
    method: "POST",
    body: JSON.stringify(logoutData),
  });
};

export const refreshToken = (): Promise<TokenResponse> => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  return apiClient.request<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
};

export const getCurrentUser = (): Promise<UserResponse> => {
  return apiClient.request<UserResponse>("/auth/me");
};

export const updateUser = (
  userData: UserUpdateRequest
): Promise<UserResponse> => {
  return apiClient.request<UserResponse>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

export const changePassword = (
  passwordData: PasswordChangeRequest
): Promise<SuccessResponse> => {
  return apiClient.request<SuccessResponse>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(passwordData),
  });
};

export const getUserSessions = (): Promise<UserSessionsResponse> => {
  return apiClient.request<UserSessionsResponse>("/auth/sessions");
};

export const revokeSession = (sessionId: number): Promise<SuccessResponse> => {
  return apiClient.request<SuccessResponse>(`/auth/sessions/${sessionId}`, {
    method: "DELETE",
  });
};
