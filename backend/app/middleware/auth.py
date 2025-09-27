"""
Authentication middleware and dependencies.

This module provides authentication middleware and FastAPI dependencies for protected routes.
"""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_postgres_session
from app.models.user import User, UserSession
from app.utils.jwt import verify_token
from app.models.schemas import UserResponse

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
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_postgres_session)
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials
        db: Database session
        
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
        user_id: int = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
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
        session_result = await db.execute(
            select(UserSession).where(
                UserSession.user_id == user_id,
                UserSession.session_token == credentials.credentials,
                UserSession.is_active == True
            )
        )
        session = session_result.scalar_one_or_none()
        
        if session is None or session.is_expired:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired or invalid",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last used timestamp
        from sqlalchemy import func
        session.last_used_at = func.now()
        await db.commit()
        
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


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_postgres_session)
) -> Optional[User]:
    """
    Get the current user if authenticated, otherwise return None.
    
    Args:
        credentials: Optional HTTP Bearer credentials
        db: Database session
        
    Returns:
        Optional[User]: The authenticated user or None
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


def require_permissions(*permissions: str):
    """
    Decorator to require specific permissions for a route.
    
    Args:
        *permissions: Required permissions
        
    Returns:
        Dependency function
    """
    async def permission_checker(current_user: User = Depends(get_current_user)):
        # For now, all authenticated users have all permissions
        # This can be extended with role-based permissions
        return current_user
    
    return permission_checker


def require_admin():
    """
    Decorator to require admin privileges for a route.
    
    Returns:
        Dependency function
    """
    async def admin_checker(current_user: User = Depends(get_current_user)):
        # For now, all authenticated users are considered admins
        # This can be extended with proper role checking
        return current_user
    
    return admin_checker
