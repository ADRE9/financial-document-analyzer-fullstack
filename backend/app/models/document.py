"""
Document models for MongoDB using Beanie ODM.

This module contains Beanie document models for financial document storage and analysis
following latest 2024 best practices.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum
from beanie import Document, Indexed
from pydantic import Field, ConfigDict, field_validator
from pymongo import IndexModel

from .base import BaseDocument


class DocumentType(str, Enum):
    """Document type enumeration."""
    INVOICE = "invoice"
    RECEIPT = "receipt"
    STATEMENT = "statement"
    CONTRACT = "contract"
    OTHER = "other"


class DocumentStatus(str, Enum):
    """Document processing status enumeration."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    ARCHIVED = "archived"


class FinancialDocument(BaseDocument):
    """Financial document model for storing uploaded documents and analysis results."""
    
    # Document identification
    filename: str = Field(..., max_length=255)
    original_filename: str = Field(..., max_length=255)
    document_type: DocumentType = Field(...)
    description: Optional[str] = Field(None, max_length=1000)
    
    # User association
    user_id: Indexed(str) = Field(...)  # String representation of User ObjectId
    
    # File information
    file_path: str = Field(...)  # Path to stored file
    file_size: int = Field(..., gt=0)  # File size in bytes
    file_hash: Indexed(str) = Field(...)  # MD5 or SHA256 hash for deduplication
    mime_type: str = Field(...)
    
    # Processing status
    status: DocumentStatus = Field(default=DocumentStatus.UPLOADED)
    processing_started_at: Optional[datetime] = Field(None)
    processing_completed_at: Optional[datetime] = Field(None)
    processing_error: Optional[str] = Field(None, max_length=1000)
    
    # Analysis results
    extracted_text: Optional[str] = Field(None)
    analysis_results: Optional[Dict[str, Any]] = Field(default_factory=dict)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # Password protection
    is_password_protected: bool = Field(default=False)
    password_required: bool = Field(default=False)
    
    # Metadata
    tags: List[str] = Field(default_factory=list)
    is_archived: bool = Field(default=False)
    
    # Settings
    model_config = ConfigDict(
        json_encoders={datetime: lambda v: v.isoformat()}
    )
    
    class Settings:
        name = "financial_documents"
        use_state_management = True
        validate_on_save = True
        indexes = [
            IndexModel("user_id"),
            IndexModel("document_type"),
            IndexModel("status"),
            IndexModel("file_hash"),
            IndexModel("is_archived"),
            IndexModel([("user_id", 1), ("document_type", 1)]),
            IndexModel([("user_id", 1), ("status", 1)]),
            IndexModel([("user_id", 1), ("created_at", -1)]),  # Recent documents first
            IndexModel([("created_at", -1)]),  # All recent documents
            # Text search index for filename and description
            IndexModel([("filename", "text"), ("description", "text"), ("extracted_text", "text")]),
            # Compound index for user queries
            IndexModel([("user_id", 1), ("is_archived", 1), ("status", 1)]),
        ]
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        """Validate and clean tags."""
        if v is None:
            return []
        # Remove empty tags, strip whitespace, convert to lowercase
        return [tag.strip().lower() for tag in v if tag and tag.strip()]
    
    @field_validator('file_size')
    @classmethod
    def validate_file_size(cls, v):
        """Validate file size (max 100MB as per requirements)."""
        max_size = 100 * 1024 * 1024  # 100MB in bytes
        if v > max_size:
            raise ValueError(f'File size cannot exceed {max_size} bytes')
        return v
    
    @classmethod
    async def find_by_user(
        cls, 
        user_id: str, 
        document_type: Optional[DocumentType] = None,
        status: Optional[DocumentStatus] = None,
        include_archived: bool = False,
        limit: int = 50,
        skip: int = 0
    ) -> List["FinancialDocument"]:
        """Find documents by user with optional filtering."""
        query = {"user_id": user_id}
        
        if not include_archived:
            query["is_archived"] = False
        
        if document_type:
            query["document_type"] = document_type
        
        if status:
            query["status"] = status
        
        return await cls.find(query)\
            .sort([("created_at", -1)])\
            .skip(skip)\
            .limit(limit)\
            .to_list()
    
    @classmethod
    async def find_by_hash(cls, file_hash: str) -> Optional["FinancialDocument"]:
        """Find document by file hash (for deduplication)."""
        return await cls.find_one({"file_hash": file_hash})
    
    @classmethod
    async def search_documents(
        cls,
        user_id: str,
        search_query: str,
        document_type: Optional[DocumentType] = None,
        limit: int = 20
    ) -> List["FinancialDocument"]:
        """Search documents by text content."""
        query = {
            "user_id": user_id,
            "is_archived": False,
            "$text": {"$search": search_query}
        }
        
        if document_type:
            query["document_type"] = document_type
        
        return await cls.find(query)\
            .sort([("score", {"$meta": "textScore"})])\
            .limit(limit)\
            .to_list()
    
    async def start_processing(self):
        """Mark document as processing."""
        self.status = DocumentStatus.PROCESSING
        self.processing_started_at = datetime.now(timezone.utc)
        self.processing_error = None
        await self.save()
    
    async def complete_processing(
        self,
        analysis_results: Dict[str, Any],
        confidence_score: float,
        extracted_text: Optional[str] = None
    ):
        """Mark document processing as completed."""
        self.status = DocumentStatus.COMPLETED
        self.processing_completed_at = datetime.now(timezone.utc)
        self.analysis_results = analysis_results
        self.confidence_score = confidence_score
        if extracted_text:
            self.extracted_text = extracted_text
        self.processing_error = None
        await self.save()
    
    async def fail_processing(self, error_message: str):
        """Mark document processing as failed."""
        self.status = DocumentStatus.FAILED
        self.processing_completed_at = datetime.now(timezone.utc)
        self.processing_error = error_message
        await self.save()
    
    async def archive(self):
        """Archive this document."""
        self.is_archived = True
        await self.save()
    
    async def unarchive(self):
        """Unarchive this document."""
        self.is_archived = False
        await self.save()
    
    async def add_tags(self, new_tags: List[str]):
        """Add tags to document."""
        # Clean and deduplicate tags
        cleaned_tags = [tag.strip().lower() for tag in new_tags if tag and tag.strip()]
        current_tags = set(self.tags)
        current_tags.update(cleaned_tags)
        self.tags = list(current_tags)
        await self.save()
    
    async def remove_tags(self, tags_to_remove: List[str]):
        """Remove tags from document."""
        tags_to_remove_set = {tag.strip().lower() for tag in tags_to_remove}
        self.tags = [tag for tag in self.tags if tag not in tags_to_remove_set]
        await self.save()
    
    @property
    def processing_duration(self) -> Optional[float]:
        """Get processing duration in seconds."""
        if self.processing_started_at and self.processing_completed_at:
            return (self.processing_completed_at - self.processing_started_at).total_seconds()
        return None
    
    @property
    def file_size_mb(self) -> float:
        """Get file size in MB."""
        return self.file_size / (1024 * 1024)
    
    def to_response_dict(self, include_analysis: bool = True) -> dict:
        """Convert to dictionary for API responses."""
        data = {
            "id": str(self.id),
            "filename": self.filename,
            "original_filename": self.original_filename,
            "document_type": self.document_type,
            "description": self.description,
            "file_size": self.file_size,
            "file_size_mb": self.file_size_mb,
            "mime_type": self.mime_type,
            "status": self.status,
            "confidence_score": self.confidence_score,
            "tags": self.tags,
            "is_archived": self.is_archived,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "processing_started_at": self.processing_started_at,
            "processing_completed_at": self.processing_completed_at,
            "processing_duration": self.processing_duration,
            "processing_error": self.processing_error
        }
        
        if include_analysis:
            data.update({
                "analysis_results": self.analysis_results,
                "extracted_text": self.extracted_text
            })
        
        return data
    
    @classmethod
    async def get_user_statistics(cls, user_id: str) -> Dict[str, Any]:
        """Get document statistics for a user."""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": None,
                "total_documents": {"$sum": 1},
                "total_size": {"$sum": "$file_size"},
                "by_type": {"$addToSet": "$document_type"},
                "by_status": {"$addToSet": "$status"},
                "completed_count": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                },
                "processing_count": {
                    "$sum": {"$cond": [{"$eq": ["$status", "processing"]}, 1, 0]}
                },
                "failed_count": {
                    "$sum": {"$cond": [{"$eq": ["$status", "failed"]}, 1, 0]}
                },
                "archived_count": {
                    "$sum": {"$cond": ["$is_archived", 1, 0]}
                }
            }}
        ]
        
        result = await cls.aggregate(pipeline).to_list()
        if result:
            stats = result[0]
            return {
                "total_documents": stats.get("total_documents", 0),
                "total_size_bytes": stats.get("total_size", 0),
                "total_size_mb": stats.get("total_size", 0) / (1024 * 1024),
                "completed_documents": stats.get("completed_count", 0),
                "processing_documents": stats.get("processing_count", 0),
                "failed_documents": stats.get("failed_count", 0),
                "archived_documents": stats.get("archived_count", 0)
            }
        
        return {
            "total_documents": 0,
            "total_size_bytes": 0,
            "total_size_mb": 0,
            "completed_documents": 0,
            "processing_documents": 0,
            "failed_documents": 0,
            "archived_documents": 0
        }
