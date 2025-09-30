"""
Protected routes for testing authentication.

This module contains protected endpoints that require authentication to access.
"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer

from app.models.schemas import SuccessResponse, UserResponse
from app.middleware.auth import get_current_active_user, get_current_admin_user, get_current_viewer_user, require_admin, require_viewer
from app.models.user import User
from app.utils.jwt import verify_token

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/protected", tags=["protected"])


@router.get("/hello", response_model=SuccessResponse)
async def hello_protected_route(
    current_user: User = Depends(get_current_active_user)
):
    """
    A simple protected route that says hello to the authenticated user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        SuccessResponse: Hello message with user information
    """
    logger.info(f"Protected route accessed by user: {current_user.username}")
    
    return SuccessResponse(
        message=f"Hello {current_user.username}! This is a protected route.",
        data={
            "user_id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "access_time": datetime.now(timezone.utc).isoformat()
        },
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/user-info", response_model=UserResponse)
async def get_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed information about the current user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Detailed user information
    """
    logger.info(f"User info requested by: {current_user.username}")
    
    return UserResponse(**current_user.to_response_dict())


@router.get("/admin-only", response_model=SuccessResponse)
async def admin_only_route(
    current_user: User = Depends(get_current_admin_user)
):
    """
    An admin-only protected route requiring Admin role.
    
    Args:
        current_user: Current authenticated admin user
        
    Returns:
        SuccessResponse: Admin access confirmation
    """
    logger.info(f"Admin route accessed by user: {current_user.username} (Role: {current_user.role})")
    
    return SuccessResponse(
        message=f"Welcome to the admin area, {current_user.username}!",
        data={
            "user_id": str(current_user.id),
            "username": current_user.username,
            "role": current_user.role.value,
            "access_level": "admin",
            "access_time": datetime.now(timezone.utc).isoformat()
        },
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/viewer-access", response_model=SuccessResponse)
async def viewer_access_route(
    current_user: User = Depends(get_current_viewer_user)
):
    """
    A route accessible by viewers and admins.
    
    Args:
        current_user: Current authenticated user with viewer role or higher
        
    Returns:
        SuccessResponse: Viewer access confirmation
    """
    logger.info(f"Viewer route accessed by user: {current_user.username} (Role: {current_user.role})")
    
    return SuccessResponse(
        message=f"Hello {current_user.username}! You have viewer access or higher.",
        data={
            "user_id": str(current_user.id),
            "username": current_user.username,
            "role": current_user.role.value,
            "access_level": "viewer",
            "access_time": datetime.now(timezone.utc).isoformat()
        },
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/admin-with-decorator", response_model=SuccessResponse)
async def admin_with_decorator_route(
    current_user: User = Depends(require_admin())
):
    """
    Admin route using decorator pattern for role checking.
    
    Args:
        current_user: Current authenticated admin user
        
    Returns:
        SuccessResponse: Admin access confirmation
    """
    logger.info(f"Admin decorator route accessed by user: {current_user.username} (Role: {current_user.role})")
    
    return SuccessResponse(
        message=f"Admin decorator route accessed by {current_user.username}!",
        data={
            "user_id": str(current_user.id),
            "username": current_user.username,
            "role": current_user.role.value,
            "decorator_type": "require_admin",
            "access_time": datetime.now(timezone.utc).isoformat()
        },
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/test-auth", response_model=SuccessResponse)
async def test_authentication(
    current_user: User = Depends(get_current_active_user)
):
    """
    Test endpoint to verify authentication is working correctly.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        SuccessResponse: Authentication test results
    """
    logger.info(f"Authentication test accessed by user: {current_user.username}")
    
    return SuccessResponse(
        message="Authentication test successful!",
        data={
            "authenticated": True,
            "user_id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
            "test_time": datetime.now(timezone.utc).isoformat(),
            "status": "Authentication system is working correctly"
        },
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/test-simple", response_model=SuccessResponse)
async def test_simple_auth(
    token: str = Depends(HTTPBearer())
):
    """
    Simple test endpoint that only verifies JWT token without database access.
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        SuccessResponse: Simple authentication test results
    """
    try:
        # Verify token without database access
        payload = verify_token(token.credentials, token_type="access")
        user_id = payload.get("sub")
        
        logger.info(f"Simple auth test accessed by user ID: {user_id}")
        
        return SuccessResponse(
            message="Simple authentication test successful!",
            data={
                "authenticated": True,
                "user_id": user_id,
                "test_time": datetime.now(timezone.utc).isoformat(),
                "status": "JWT token verification working correctly"
            },
            timestamp=datetime.now(timezone.utc)
        )
        
    except Exception as e:
        logger.error(f"Simple auth test failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed"
        )
