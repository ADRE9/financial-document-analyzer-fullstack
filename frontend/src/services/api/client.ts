import { tokenManager } from "../../utils/tokenManager";
import type { ErrorResponse } from "../../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        return this.retryWithRefreshedToken<T>(url, config);
      }

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
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

  private async retryWithRefreshedToken<T>(
    url: string,
    config: RequestInit
  ): Promise<T> {
    try {
      const newAccessToken = await tokenManager.refreshAccessToken();

      const retryConfig: RequestInit = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      };

      const retryResponse = await fetch(url, retryConfig);

      if (!retryResponse.ok) {
        throw await this.handleErrorResponse(retryResponse);
      }

      if (retryResponse.status === 204) {
        return {} as T;
      }

      return await retryResponse.json();
    } catch {
      tokenManager.clearTokens();
      throw new Error("Session expired. Please log in again.");
    }
  }

  private async handleErrorResponse(response: Response): Promise<Error> {
    let errorMessage = "An error occurred";

    try {
      const errorData: ErrorResponse = await response.json();
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      errorMessage = this.getStatusBasedErrorMessage(response.status);
    }

    const error = new Error(errorMessage) as Error & {
      status: number;
      response: { status: number };
    };
    error.status = response.status;
    error.response = { status: response.status };
    return error;
  }

  private getStatusBasedErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return "Bad request. Please check your input.";
      case 401:
        return "Unauthorized. Please check your credentials.";
      case 403:
        return "Access forbidden. You don't have permission for this action.";
      case 404:
        return "Resource not found.";
      case 409:
        return "Conflict. The resource already exists or is in use.";
      case 422:
        return "Validation error. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Internal server error. Please try again later.";
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return `Request failed with status ${status}`;
    }
  }
}

export const apiClient = new ApiClient();
