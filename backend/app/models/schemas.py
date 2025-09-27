from pydantic import BaseModel, Field, ConfigDict, EmailStr, validator
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


class DocumentUploadRequest(BaseModel):
    """Document upload request model."""
    filename: str = Field(..., description="Name of the uploaded file")
    document_type: DocumentType = Field(..., description="Type of the document")
    description: Optional[str] = Field(None, description="Optional description of the document")


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
    password: str = Field(..., min_length=8, max_length=20, description="Password (8-20 characters)")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username format."""
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.lower()
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 20:
            raise ValueError('Password must be at most 20 characters long')
        
        # Check for alphanumeric and special characters
        has_alpha = bool(re.search(r'[a-zA-Z]', v))
        has_digit = bool(re.search(r'\d', v))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', v))
        
        if not (has_alpha and has_digit and has_special):
            raise ValueError('Password must contain at least one letter, one number, and one special character')
        
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
    
    id: int
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
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
    new_password: str = Field(..., min_length=8, max_length=20, description="New password (8-20 characters)")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        """Validate new password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 20:
            raise ValueError('Password must be at most 20 characters long')
        
        # Check for alphanumeric and special characters
        has_alpha = bool(re.search(r'[a-zA-Z]', v))
        has_digit = bool(re.search(r'\d', v))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', v))
        
        if not (has_alpha and has_digit and has_special):
            raise ValueError('Password must contain at least one letter, one number, and one special character')
        
        return v


class LogoutRequest(BaseModel):
    """Logout request model."""
    logout_all_devices: bool = Field(False, description="Logout from all devices")


class SessionInfo(BaseModel):
    """Session information model."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    session_id: int
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
