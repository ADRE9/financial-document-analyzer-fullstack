// API Types based on backend schemas

export const HealthStatus = {
  HEALTHY: "healthy",
  UNHEALTHY: "unhealthy",
} as const;

export type HealthStatus = (typeof HealthStatus)[keyof typeof HealthStatus];

export interface HealthResponse {
  status: HealthStatus;
  message: string;
  timestamp: string;
  version: string;
}

export const DocumentType = {
  INVOICE: "invoice",
  RECEIPT: "receipt",
  STATEMENT: "statement",
  CONTRACT: "contract",
  OTHER: "other",
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export interface DocumentUploadRequest {
  filename: string;
  document_type: DocumentType;
  description?: string;
}

export interface DocumentAnalysisResponse {
  document_id: string;
  filename: string;
  document_type: DocumentType;
  analysis_results: Record<string, unknown>;
  confidence_score: number;
  processed_at: string;
  status: string;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
  timestamp: string;
}

export interface SuccessResponse {
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

// Authentication Types
export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface LogoutRequest {
  logout_all_devices?: boolean;
}

export interface SessionInfo {
  session_id: number;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string;
  expires_at: string;
}

export interface UserSessionsResponse {
  sessions: SessionInfo[];
  total_sessions: number;
}
