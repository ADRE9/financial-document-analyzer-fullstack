from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


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
