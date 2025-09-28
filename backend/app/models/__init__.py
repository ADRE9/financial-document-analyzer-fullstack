"""
Models package for MongoDB using Beanie ODM.

This package contains all Beanie document models and Pydantic schemas
for the Financial Document Analyzer application.
"""

# Beanie document models
from .base import BaseDocument, TimestampMixin
from .user import User, UserSession
from .document import FinancialDocument, DocumentType, DocumentStatus

# Pydantic schemas for API validation
from .schemas import (
    # Health schemas
    HealthStatus,
    HealthResponse,
    
    # Document schemas
    DocumentUploadRequest,
    DocumentAnalysisResponse,
    
    # Response schemas
    ErrorResponse,
    SuccessResponse,
    
    # Authentication schemas
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    UserUpdateRequest,
    PasswordChangeRequest,
    LogoutRequest,
    SessionInfo,
    UserSessionsResponse,
)

# List of all Beanie document models for database initialization
DOCUMENT_MODELS = [
    User,
    UserSession,
    FinancialDocument,
]

__all__ = [
    # Base classes
    "BaseDocument",
    "TimestampMixin",
    
    # Document models
    "User",
    "UserSession", 
    "FinancialDocument",
    "DocumentType",
    "DocumentStatus",
    
    # Pydantic schemas
    "HealthStatus",
    "HealthResponse",
    "DocumentUploadRequest",
    "DocumentAnalysisResponse",
    "ErrorResponse",
    "SuccessResponse",
    "UserRegisterRequest",
    "UserLoginRequest",
    "TokenResponse",
    "UserResponse",
    "UserUpdateRequest",
    "PasswordChangeRequest",
    "LogoutRequest",
    "SessionInfo",
    "UserSessionsResponse",
    
    # Document models list
    "DOCUMENT_MODELS",
]