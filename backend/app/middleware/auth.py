"""
Authentication middleware and dependencies for MongoDB/Beanie.

This module provides authentication middleware and FastAPI dependencies for protected routes
using MongoDB and Beanie ODM.
"""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.user import User, UserSession
from app.utils.jwt import verify_token
from app.models.schemas import UserResponse, UserRole

# Configure logging
logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer()


class AuthMiddleware:
    """Authentication middleware for protecting routes."""
    
    def __init__(self, auto_error: bool = True):
        self.auto_error = auto_error
    
    async def __call__(self, request: Request, call_next):
        """Process request through authentication middleware."""
        # Skip authentication for certain paths
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Check if the route requires authentication
        if hasattr(request, "route") and hasattr(request.route, "dependencies"):
            # Check if any dependency requires authentication
            auth_required = any(
                isinstance(dep, Depends) and 
                hasattr(dep.dependency, "__name__") and 
                "current_user" in dep.dependency.__name__
                for dep in request.route.dependencies
            )
            
            if not auth_required:
                return await call_next(request)
        
        # For now, let the dependency injection handle authentication
        # This middleware can be extended for additional auth logic
        return await call_next(request)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials
        
    Returns:
        User: The authenticated user
        
    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the JWT token
        payload = verify_token(credentials.credentials, token_type="access")
        user_id_str = payload.get("sub")
        
        if user_id_str is None:
            raise credentials_exception
        
        # Get user from MongoDB using Beanie (convert string ID to ObjectId)
        user = await User.find_by_id(user_id_str)
        
        if user is None:
            raise credentials_exception
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive user",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify session is still active
        session = await UserSession.find_by_token(credentials.credentials)
        
        if session is None or not session.is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired or invalid",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last used timestamp
        from datetime import datetime, timezone
        await session.update_with_timestamp({"last_used_at": datetime.now(timezone.utc)})
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise credentials_exception


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get the current active user (additional check for active status).
    
    Args:
        current_user: The current user from get_current_user
        
    Returns:
        User: The active user
        
    Raises:
        HTTPException: If user is not active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get the current user and verify they have admin role.
    
    Args:
        current_user: The current active user
        
    Returns:
        User: The admin user
        
    Raises:
        HTTPException: If user doesn't have admin role
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin role required."
        )
    return current_user


async def get_current_viewer_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get the current user and verify they have viewer role or higher.
    
    Args:
        current_user: The current active user
        
    Returns:
        User: The user with viewer permissions or higher
        
    Raises:
        HTTPException: If user doesn't have appropriate role
    """
    if not (current_user.is_viewer or current_user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Viewer role or higher required."
        )
    return current_user


def require_role(required_role: UserRole):
    """
    Dependency function to require a specific role for a route.
    
    Args:
        required_role: The role required to access the route
        
    Returns:
        Dependency function
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)):
        if required_role == UserRole.ADMIN:
            if not current_user.is_admin:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin role required"
                )
        elif required_role == UserRole.VIEWER:
            if not (current_user.is_viewer or current_user.is_admin):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Viewer role or higher required"
                )
        return current_user
    
    return role_checker


def require_admin():
    """
    Decorator to require admin privileges for a route.
    
    Returns:
        Dependency function that checks for admin role
    """
    return require_role(UserRole.ADMIN)


def require_viewer():
    """
    Decorator to require viewer privileges or higher for a route.
    
    Returns:
        Dependency function that checks for viewer role or higher
        
    Note:
        This function is provided for consistency but viewers typically
        use get_current_active_user since all authenticated users have
        at least viewer privileges.
    """
    return require_role(UserRole.VIEWER)