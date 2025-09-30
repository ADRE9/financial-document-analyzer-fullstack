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
  CrewAnalysisRequest,
  CrewAnalysisResponse,
  DocumentValidationResponse,
  CrewHealthResponse,
} from "../types/api";
import { tokenManager } from "../utils/tokenManager";

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

    const defaultHeaders: Record<string, string> = {};

    // Only set Content-Type to application/json if it's not a FormData request
    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    // Add authorization header if token exists
    const authHeader = tokenManager.getAuthHeader();
    if (authHeader) {
      defaultHeaders["Authorization"] = authHeader;
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

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && tokenManager.isAuthenticated()) {
        try {
          const newAccessToken = await tokenManager.refreshAccessToken();

          // Retry the request with the new token
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          };

          const retryResponse = await fetch(url, retryConfig);

          if (!retryResponse.ok) {
            let errorMessage = "An error occurred";

            try {
              const errorData: ErrorResponse = await retryResponse.json();
              errorMessage =
                errorData.detail || errorData.error || errorMessage;
            } catch {
              errorMessage = `Request failed with status ${retryResponse.status}`;
            }

            const error = new Error(errorMessage) as Error & {
              status: number;
              response: { status: number };
            };
            error.status = retryResponse.status;
            error.response = { status: retryResponse.status };
            throw error;
          }

          // Handle empty responses (like 204 No Content)
          if (retryResponse.status === 204) {
            return {} as T;
          }

          return await retryResponse.json();
        } catch {
          // If refresh fails, clear tokens and throw original error
          tokenManager.clearTokens();
          throw new Error("Session expired. Please log in again.");
        }
      }

      if (!response.ok) {
        let errorMessage = "An error occurred";

        try {
          const errorData: ErrorResponse = await response.json();
          errorMessage = errorData.detail || errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad request. Please check your input.";
              break;
            case 401:
              errorMessage = "Unauthorized. Please check your credentials.";
              break;
            case 403:
              errorMessage =
                "Access forbidden. You don't have permission for this action.";
              break;
            case 404:
              errorMessage = "Resource not found.";
              break;
            case 409:
              errorMessage =
                "Conflict. The resource already exists or is in use.";
              break;
            case 422:
              errorMessage = "Validation error. Please check your input.";
              break;
            case 429:
              errorMessage = "Too many requests. Please try again later.";
              break;
            case 500:
              errorMessage = "Internal server error. Please try again later.";
              break;
            case 502:
            case 503:
            case 504:
              errorMessage =
                "Service temporarily unavailable. Please try again later.";
              break;
            default:
              errorMessage = `Request failed with status ${response.status}`;
          }
        }

        const error = new Error(errorMessage) as Error & {
          status: number;
          response: { status: number };
        };
        error.status = response.status;
        error.response = { status: response.status };
        throw error;
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
    formData.append("document_type", uploadData.document_type);
    if (uploadData.description) {
      formData.append("description", uploadData.description);
    }
    if (uploadData.password) {
      formData.append("password", uploadData.password);
    }
    if (uploadData.auto_analyze !== undefined) {
      formData.append("auto_analyze", uploadData.auto_analyze.toString());
    }
    if (uploadData.analysis_query) {
      formData.append("analysis_query", uploadData.analysis_query);
    }

    return this.request<DocumentAnalysisResponse>("/documents/upload", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it with boundary for multipart/form-data
      body: formData,
    });
  }

  async deleteDocument(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/documents/${id}`, {
      method: "DELETE",
    });
  }

  async analyzeDocument(
    id: string,
    query: string = "Provide a comprehensive financial analysis of this document"
  ): Promise<DocumentAnalysisResponse> {
    return this.request<DocumentAnalysisResponse>(
      `/documents/${id}/analyze?query=${encodeURIComponent(query)}`,
      {
        method: "POST",
      }
    );
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

  // Analytics endpoints
  async getAnalyticsOverview(): Promise<any> {
    return this.request<any>("/analytics/overview");
  }

  async getProcessingTrends(days: number = 30): Promise<any> {
    return this.request<any>(`/analytics/trends?days=${days}`);
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.request<any>("/analytics/performance");
  }

  async getDocumentTypeAnalytics(): Promise<any> {
    return this.request<any>("/analytics/document-types");
  }

  // CrewAI Analysis endpoints
  async runCrewAnalysis(
    requestData: CrewAnalysisRequest
  ): Promise<CrewAnalysisResponse> {
    return this.request<CrewAnalysisResponse>("/crew/analyze", {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  }

  async getCrewHealth(): Promise<CrewHealthResponse> {
    return this.request<CrewHealthResponse>("/crew/health");
  }

  async validateDocument(
    requestData: CrewAnalysisRequest
  ): Promise<DocumentValidationResponse> {
    return this.request<DocumentValidationResponse>("/crew/validate-document", {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual methods for convenience with proper binding
export const getHealth = () => apiClient.getHealth();
export const getDocuments = () => apiClient.getDocuments();
export const getDocument = (id: string) => apiClient.getDocument(id);
export const uploadDocument = (file: File, uploadData: DocumentUploadRequest) =>
  apiClient.uploadDocument(file, uploadData);
export const deleteDocument = (id: string) => apiClient.deleteDocument(id);
export const analyzeDocument = (id: string, query?: string) =>
  apiClient.analyzeDocument(id, query);
export const register = (userData: UserRegisterRequest) =>
  apiClient.register(userData);
export const login = (credentials: UserLoginRequest) =>
  apiClient.login(credentials);
export const logout = (logoutData: LogoutRequest = {}) =>
  apiClient.logout(logoutData);
export const refreshToken = () => apiClient.refreshToken();
export const getCurrentUser = () => apiClient.getCurrentUser();
export const updateUser = (userData: UserUpdateRequest) =>
  apiClient.updateUser(userData);
export const changePassword = (passwordData: PasswordChangeRequest) =>
  apiClient.changePassword(passwordData);
export const getUserSessions = () => apiClient.getUserSessions();
export const revokeSession = (sessionId: number) =>
  apiClient.revokeSession(sessionId);
export const runCrewAnalysis = (requestData: CrewAnalysisRequest) =>
  apiClient.runCrewAnalysis(requestData);
export const getCrewHealth = (): Promise<CrewHealthResponse> =>
  apiClient.getCrewHealth();
export const validateDocument = (
  requestData: CrewAnalysisRequest
): Promise<DocumentValidationResponse> =>
  apiClient.validateDocument(requestData);
export const getAnalyticsOverview = () => apiClient.getAnalyticsOverview();
export const getProcessingTrends = (days?: number) =>
  apiClient.getProcessingTrends(days);
export const getPerformanceMetrics = () => apiClient.getPerformanceMetrics();
export const getDocumentTypeAnalytics = () =>
  apiClient.getDocumentTypeAnalytics();
