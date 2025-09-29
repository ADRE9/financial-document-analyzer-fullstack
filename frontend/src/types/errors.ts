/**
 * Enhanced error types for better error handling
 */

export interface ApiErrorResponse {
  error?: string;
  detail?: string;
  timestamp?: string;
}

export interface ApiError extends Error {
  status: number;
  response: {
    status: number;
  };
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof Error && "status" in error && "response" in error;
};

export const createApiError = (message: string, status: number): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.response = { status };
  return error;
};
