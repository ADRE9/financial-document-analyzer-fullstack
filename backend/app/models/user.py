"""
User document models for MongoDB using Beanie ODM.

This module contains Beanie document models for user authentication and session management
following latest 2024 best practices.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import Field, EmailStr, ConfigDict
from pymongo import IndexModel

from .base import BaseDocument
from .schemas import UserRole


class User(BaseDocument):
    """User document for authentication and profile management."""
    
    # User identification - indexed for fast lookups
    username: Indexed(str, unique=True) = Field(..., min_length=3, max_length=50)
    email: Indexed(EmailStr, unique=True) = Field(...)
    
    # Authentication
    hashed_password: str = Field(...)
    role: UserRole = Field(default=UserRole.VIEWER, description="User role for access control")
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    
    # Profile information
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    
    # Settings
    model_config = ConfigDict(
        json_encoders={datetime: lambda v: v.isoformat()},
        str_strip_whitespace=True
    )
    
    class Settings:
        name = "users"
        use_state_management = True
        validate_on_save = True
        indexes = [
            # Compound index for active verified users
            IndexModel([("is_active", 1), ("is_verified", 1)]),
            # Index for role-based queries
            IndexModel([("role", 1), ("is_active", 1)]),
        ]
    
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return self.username
    
    @classmethod
    async def find_by_username(cls, username: str) -> Optional["User"]:
        """Find user by username."""
        return await cls.find_one({"username": username.lower()})
    
    @classmethod
    async def find_by_email(cls, email: str) -> Optional["User"]:
        """Find user by email."""
        return await cls.find_one({"email": email.lower()})
    
    @classmethod
    async def find_by_username_or_email(cls, identifier: str) -> Optional["User"]:
        """Find user by username or email."""
        identifier = identifier.lower()
        return await cls.find_one({
            "$or": [
                {"username": identifier},
                {"email": identifier}
            ]
        })
    
    async def get_active_sessions(self) -> List["UserSession"]:
        """Get all active sessions for this user."""
        return await UserSession.find({
            "user_id": self.id,
            "is_active": True,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        }).to_list()
    
    async def deactivate_all_sessions(self):
        """Deactivate all sessions for this user."""
        await UserSession.find({
            "user_id": self.id,
            "is_active": True
        }).update({"$set": {"is_active": False}})
    
    @property
    def is_admin(self) -> bool:
        """Check if user has admin role."""
        return self.role == UserRole.ADMIN
    
    @property
    def is_viewer(self) -> bool:
        """Check if user has viewer role."""
        return self.role == UserRole.VIEWER
    
    def has_role(self, role: UserRole) -> bool:
        """Check if user has a specific role."""
        return self.role == role
    
    def to_response_dict(self) -> dict:
        """Convert to dictionary for API responses (excludes sensitive data)."""
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "role": self.role,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }


class UserSession(BaseDocument):
    """User session document for JWT token management."""
    
    # Session identification
    user_id: Indexed(str) = Field(...)  # String representation of User ObjectId
    session_token: Indexed(str, unique=True) = Field(...)
    refresh_token: Optional[Indexed(str, unique=True)] = Field(None)
    
    # Session metadata
    device_info: Optional[str] = Field(None, max_length=500)
    ip_address: Optional[str] = Field(None, max_length=45)  # IPv6 compatible
    user_agent: Optional[str] = Field(None, max_length=1000)
    
    # Session status
    is_active: bool = Field(default=True)
    expires_at: Indexed(datetime) = Field(...)
    last_used_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Settings
    model_config = ConfigDict(
        json_encoders={datetime: lambda v: v.isoformat()}
    )
    
    class Settings:
        name = "user_sessions"
        use_state_management = True
        validate_on_save = True
        indexes = [
            IndexModel([("user_id", 1), ("is_active", 1)]),
            IndexModel([("expires_at", 1), ("is_active", 1)]),
            # TTL index to automatically delete expired sessions
            IndexModel("expires_at", expireAfterSeconds=0),
        ]
    
    @property
    def is_expired(self) -> bool:
        """Check if session is expired."""
        now_utc = datetime.now(timezone.utc)
        # Ensure expires_at is timezone-aware
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return now_utc > expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if session is valid (active and not expired)."""
        return self.is_active and not self.is_expired
    
    @classmethod
    async def find_by_token(cls, token: str) -> Optional["UserSession"]:
        """Find session by access token."""
        return await cls.find_one({
            "session_token": token,
            "is_active": True,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
    
    @classmethod
    async def find_by_refresh_token(cls, refresh_token: str) -> Optional["UserSession"]:
        """Find session by refresh token."""
        return await cls.find_one({
            "refresh_token": refresh_token,
            "is_active": True,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
    
    @classmethod
    async def create_session(
        cls,
        user_id: str,
        session_token: str,
        refresh_token: str,
        expires_in_minutes: int = 30,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> "UserSession":
        """Create a new user session."""
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)
        
        session = cls(
            user_id=user_id,
            session_token=session_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
            device_info=device_info,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        await session.save()
        return session
    
    async def extend_session(self, extend_minutes: int = 30):
        """Extend session expiration time."""
        self.expires_at = datetime.now(timezone.utc) + timedelta(minutes=extend_minutes)
        self.last_used_at = datetime.now(timezone.utc)
        await self.save()
    
    async def deactivate(self):
        """Deactivate this session."""
        self.is_active = False
        await self.save()
    
    @classmethod
    async def cleanup_expired_sessions(cls):
        """Remove expired sessions (in addition to TTL index)."""
        await cls.find({
            "expires_at": {"$lt": datetime.now(timezone.utc)}
        }).delete()
    
    @classmethod
    async def get_user_sessions(cls, user_id: str, active_only: bool = True) -> List["UserSession"]:
        """Get all sessions for a user."""
        query = {"user_id": user_id}
        if active_only:
            query.update({
                "is_active": True,
                "expires_at": {"$gt": datetime.now(timezone.utc)}
            })
        
        return await cls.find(query).sort([("last_used_at", -1)]).to_list()
    
    def to_response_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "session_id": str(self.id),
            "device_info": self.device_info,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "last_used_at": self.last_used_at,
            "expires_at": self.expires_at,
            "is_expired": self.is_expired
        }