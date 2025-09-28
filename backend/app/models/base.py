"""
Base document models for MongoDB using Beanie ODM.

This module contains the base Beanie document classes with common functionality
following latest 2024 best practices.
"""

from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field
from pymongo import IndexModel


class TimestampMixin:
    """Mixin to add timestamp fields to document models."""
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def save_with_timestamp(self, **kwargs):
        """Update the updated_at timestamp before saving."""
        self.updated_at = datetime.now(timezone.utc)
        return self.save(**kwargs)


class BaseDocument(Document, TimestampMixin):
    """
    Base document class with common functionality.
    
    All document models should inherit from this class to get:
    - Automatic timestamps (created_at, updated_at)
    - Common helper methods
    - Consistent ID handling
    """
    
    class Settings:
        # Common settings for all documents
        use_state_management = True
        validate_on_save = True
    
    def dict_for_response(self, **kwargs) -> dict:
        """Convert document to dict for API responses."""
        data = self.model_dump(**kwargs)
        # Convert ObjectId to string for JSON serialization
        if "_id" in data:
            data["id"] = str(data.pop("_id"))
        return data
    
    @classmethod
    async def find_by_id(cls, doc_id: str):
        """Find document by string ID (converts to ObjectId internally)."""
        try:
            from bson import ObjectId
            return await cls.get(ObjectId(doc_id))
        except Exception:
            return None
    
    @classmethod 
    async def find_by_field(cls, field: str, value: any, limit: int = 10):
        """Find documents by field value with limit."""
        return await cls.find({field: value}).limit(limit).to_list()
    
    async def update_with_timestamp(self, update_data: dict, **kwargs):
        """Update document with automatic timestamp update."""
        update_data["updated_at"] = datetime.now(timezone.utc)
        return await self.update({"$set": update_data}, **kwargs)


# Common indexes that might be used across multiple collections
def create_timestamp_indexes():
    """Create common timestamp indexes."""
    return [
        IndexModel("created_at"),
        IndexModel("updated_at"),
        IndexModel([("created_at", -1)]),  # Descending for recent items first
    ]