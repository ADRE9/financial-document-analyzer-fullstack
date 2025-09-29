from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import re


class HealthStatus(str, Enum):
    """Health check status enumeration."""
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"


class HealthResponse(BaseModel):
    """Health check response model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    status: HealthStatus
    message: str
    timestamp: datetime
    version: str


class DocumentType(str, Enum):
    """Document type enumeration."""
    INVOICE = "invoice"
    RECEIPT = "receipt"
    STATEMENT = "statement"
    CONTRACT = "contract"
    OTHER = "other"


class UserRole(str, Enum):
    """User role enumeration for role-based access control."""
    ADMIN = "admin"
    VIEWER = "viewer"


class DocumentUploadRequest(BaseModel):
    """Document upload request model."""
    filename: str = Field(..., description="Name of the uploaded file")
    document_type: DocumentType = Field(..., description="Type of the document")
    description: Optional[str] = Field(None, description="Optional description of the document")
    password: Optional[str] = Field(None, description="Password for password-protected PDFs")


class DocumentAnalysisResponse(BaseModel):
    """Document analysis response model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    document_id: str
    filename: str
    document_type: DocumentType
    analysis_results: Dict[str, Any]
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    processed_at: datetime
    status: str = "completed"
    is_password_protected: bool = Field(default=False, description="Whether the PDF is password protected")


class ErrorResponse(BaseModel):
    """Error response model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    error: str
    detail: Optional[str] = None
    timestamp: datetime


class SuccessResponse(BaseModel):
    """Success response model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime


# Authentication Schemas

class UserRegisterRequest(BaseModel):
    """User registration request model."""
    username: str = Field(..., min_length=3, max_length=50, description="Username (3-50 characters)")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (8-128 characters)")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    role: Optional[UserRole] = Field(UserRole.VIEWER, description="User role (Admin or Viewer, defaults to Viewer)")
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        """Validate username format."""
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.lower()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength."""
        # Import validation function from utils
        from app.utils.password import validate_password_strength
        
        is_valid, error_msg = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        
        return v


class UserLoginRequest(BaseModel):
    """User login request model."""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")


class TokenResponse(BaseModel):
    """Token response model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user: "UserResponse"


class UserResponse(BaseModel):
    """User response model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    id: str  # MongoDB ObjectId as string
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class UserUpdateRequest(BaseModel):
    """User update request model."""
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    email: Optional[EmailStr] = Field(None, description="Email address")


class PasswordChangeRequest(BaseModel):
    """Password change request model."""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password (8-128 characters)")
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        """Validate new password strength."""
        # Use the centralized validation function
        from app.utils.password import validate_password_strength
        
        is_valid, error_msg = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        
        return v


class RefreshTokenRequest(BaseModel):
    """Refresh token request model."""
    refresh_token: str = Field(..., description="Refresh token")


class LogoutRequest(BaseModel):
    """Logout request model."""
    logout_all_devices: bool = Field(False, description="Logout from all devices")


class SessionInfo(BaseModel):
    """Session information model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    session_id: str  # MongoDB ObjectId as string
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_used_at: datetime
    expires_at: datetime


class UserSessionsResponse(BaseModel):
    """User sessions response model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    sessions: List[SessionInfo]
    total_sessions: int


# Update forward references
TokenResponse.model_rebuild()
