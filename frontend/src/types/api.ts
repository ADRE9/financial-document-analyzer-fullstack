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

export const UserRole = {
  ADMIN: "admin",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface DocumentUploadRequest {
  filename: string;
  document_type: DocumentType;
  description?: string;
  password?: string;
  auto_analyze?: boolean;
  analysis_query?: string;
}

export interface DocumentAnalysisResponse {
  document_id: string;
  filename: string;
  document_type: DocumentType;
  analysis_results: Record<string, unknown>;
  confidence_score: number;
  processed_at: string;
  status: string;
  is_password_protected: boolean;
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
  role?: UserRole;
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
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
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

// CrewAI Analysis Types
export interface CrewAnalysisRequest {
  document_path: string;
  query: string;
}

export interface CrewAnalysisResponse {
  status: string;
  analysis_result: Record<string, any>;
  execution_time: number;
  document_validated: boolean;
  error_message?: string;
}

export interface DocumentValidationResponse {
  status: string;
  validation_result: {
    is_financial_document: boolean;
    confidence_score?: number;
    document_type?: string;
    error?: string;
    raw_result?: string;
  };
  document_path: string;
}

export interface CrewHealthResponse {
  status: string;
  crew_importable: boolean;
  environment_variables: Record<
    string,
    {
      configured: boolean;
      is_dummy: boolean;
    }
  >;
  crew_path: string;
  warnings?: string[];
  error?: string;
}
