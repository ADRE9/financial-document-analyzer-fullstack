// API Service Layer for backend communication

import type {
  HealthResponse,
  DocumentAnalysisResponse,
  DocumentUploadRequest,
  ErrorResponse,
  SuccessResponse,
  UserRegisterRequest,
  UserLoginRequest,
  TokenResponse,
  UserResponse,
  UserUpdateRequest,
  PasswordChangeRequest,
  LogoutRequest,
  UserSessionsResponse,
} from "../types/api";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    const token = localStorage.getItem("access_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(
          errorData.detail || errorData.error || "An error occurred"
        );
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Health endpoints
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  // Document endpoints
  async getDocuments(): Promise<DocumentAnalysisResponse[]> {
    return this.request<DocumentAnalysisResponse[]>("/documents/");
  }

  async getDocument(id: string): Promise<DocumentAnalysisResponse> {
    return this.request<DocumentAnalysisResponse>(`/documents/${id}`);
  }

  async uploadDocument(
    file: File,
    uploadData: DocumentUploadRequest
  ): Promise<DocumentAnalysisResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", uploadData.filename);
    formData.append("document_type", uploadData.document_type);
    if (uploadData.description) {
      formData.append("description", uploadData.description);
    }

    return this.request<DocumentAnalysisResponse>("/documents/upload", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData,
    });
  }

  async deleteDocument(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/documents/${id}`, {
      method: "DELETE",
    });
  }

  // Authentication endpoints
  async register(userData: UserRegisterRequest): Promise<TokenResponse> {
    return this.request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: UserLoginRequest): Promise<TokenResponse> {
    return this.request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(logoutData: LogoutRequest = {}): Promise<SuccessResponse> {
    return this.request<SuccessResponse>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(logoutData),
    });
  }

  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    return this.request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>("/auth/me");
  }

  async updateUser(userData: UserUpdateRequest): Promise<UserResponse> {
    return this.request<UserResponse>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async changePassword(
    passwordData: PasswordChangeRequest
  ): Promise<SuccessResponse> {
    return this.request<SuccessResponse>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  }

  async getUserSessions(): Promise<UserSessionsResponse> {
    return this.request<UserSessionsResponse>("/auth/sessions");
  }

  async revokeSession(sessionId: number): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/auth/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual methods for convenience
export const {
  getHealth,
  getDocuments,
  getDocument,
  uploadDocument,
  deleteDocument,
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateUser,
  changePassword,
  getUserSessions,
  revokeSession,
} = apiClient;
