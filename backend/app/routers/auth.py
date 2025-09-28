"""
Authentication router for user registration, login, and session management.

This module provides authentication endpoints using MongoDB/Beanie for data persistence
and JWT tokens for session management.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field

# MongoDB/Beanie handles database sessions automatically
from app.models.user import User, UserSession
from app.models.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    UserUpdateRequest,
    PasswordChangeRequest,
    RefreshTokenRequest,
    LogoutRequest,
    SessionInfo,
    UserSessionsResponse,
    ErrorResponse,
    SuccessResponse,
    UserRole
)
from app.utils.password import verify_password, get_password_hash
from app.utils.jwt import create_access_token, create_refresh_token, verify_token
from app.config import settings
from app.middleware.auth import get_current_user, get_current_active_user

# Configure logging
logger = logging.getLogger(__name__)

# OAuth2 scheme for consistency with FastAPI pattern
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegisterRequest,
    request: Request
):
    """
    Register a new user account.
    
    Creates a new user with the provided information and returns access and refresh tokens.
    """
    logger.info(f"User registration attempt for email: {user_data.email}")
    
    try:
        # Check if username already exists
        existing_user = await User.find_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        existing_email = await User.find_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(user_data.password)
        
        # Create new user
        new_user = User(
            username=user_data.username.lower(),
            email=user_data.email.lower(),
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role or UserRole.VIEWER,  # Default to VIEWER if not specified
            is_active=True,
            is_verified=False
        )
        
        await new_user.save()
        logger.info(f"User created successfully: {new_user.username} (ID: {new_user.id})")
        
        # Create tokens
        access_token = create_access_token(
            data={"sub": str(new_user.id), "username": new_user.username, "role": new_user.role.value}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(new_user.id), "username": new_user.username, "role": new_user.role.value}
        )
        
        # Create user session
        session = await UserSession.create_session(
            user_id=str(new_user.id),
            session_token=access_token,
            refresh_token=refresh_token,
            expires_in_minutes=settings.access_token_expire_minutes,
            device_info=request.headers.get("User-Agent"),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent")
        )
        
        logger.info(f"User session created: {session.id}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=UserResponse(**new_user.to_response_dict())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )


@router.post("/login", response_model=TokenResponse)
async def login_user(
    login_data: UserLoginRequest,
    request: Request
):
    """
    Authenticate user and return access tokens.
    
    Validates user credentials and creates a new session with JWT tokens.
    """
    logger.info(f"Login attempt for email: {login_data.email}")
    
    try:
        # Get user by email
        user = await User.find_by_email(login_data.email)
        
        if not user or not verify_password(login_data.password, user.hashed_password):
            logger.warning(f"Failed login attempt for email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Create tokens
        access_token = create_access_token(
            data={"sub": str(user.id), "username": user.username, "role": user.role.value}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "username": user.username, "role": user.role.value}
        )
        
        # Create user session
        session = await UserSession.create_session(
            user_id=str(user.id),
            session_token=access_token,
            refresh_token=refresh_token,
            expires_in_minutes=settings.access_token_expire_minutes,
            device_info=request.headers.get("User-Agent"),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent")
        )
        
        logger.info(f"User logged in successfully: {user.username} (Session: {session.id})")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=UserResponse(**user.to_response_dict())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate user"
        )


@router.post("/logout", response_model=SuccessResponse)
async def logout_user(
    logout_data: LogoutRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Logout user by deactivating sessions.
    
    Can logout from current device only or all devices.
    """
    logger.info(f"Logout request for user: {current_user.username}")
    
    try:
        if logout_data.logout_all_devices:
            # Deactivate all sessions for the user
            await current_user.deactivate_all_sessions()
            message = "Logged out from all devices"
        else:
            # Deactivate only active sessions (current device)
            active_sessions = await current_user.get_active_sessions()
            for session in active_sessions:
                await session.deactivate()
            message = "Logged out successfully"
        
        logger.info(f"User logged out: {current_user.username}")
        
        return SuccessResponse(
            message=message,
            timestamp=datetime.now(timezone.utc)
        )
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to logout user"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user information.
    
    Returns the authenticated user's profile information.
    """
    return UserResponse(**current_user.to_response_dict())


@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    user_data: UserUpdateRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update current user's profile information.
    
    Allows updating first name, last name, and email.
    """
    logger.info(f"Profile update request for user: {current_user.username}")
    
    try:
        # Check if email is being changed and if it's already taken
        if user_data.email and user_data.email != current_user.email:
            existing_user = await User.find_by_email(user_data.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Update user fields
        update_data = {}
        if user_data.first_name is not None:
            update_data["first_name"] = user_data.first_name
        if user_data.last_name is not None:
            update_data["last_name"] = user_data.last_name
        if user_data.email is not None:
            update_data["email"] = user_data.email.lower()
        
        if update_data:
            await current_user.update_with_timestamp(update_data)
            # Reload user to get updated data
            updated_user = await User.get(current_user.id)
            logger.info(f"User profile updated: {current_user.username}")
            return UserResponse(**updated_user.to_response_dict())
        
        # No changes made
        return UserResponse(**current_user.to_response_dict())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )


@router.post("/change-password", response_model=SuccessResponse)
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Change user's password.
    
    Requires current password verification and deactivates all sessions.
    """
    logger.info(f"Password change request for user: {current_user.username}")
    
    try:
        # Verify current password
        if not verify_password(password_data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_hashed_password = get_password_hash(password_data.new_password)
        
        # Update password
        await current_user.update_with_timestamp({"hashed_password": new_hashed_password})
        
        # Deactivate all sessions for security
        await current_user.deactivate_all_sessions()
        
        logger.info(f"Password changed for user: {current_user.username}")
        
        return SuccessResponse(
            message="Password changed successfully. Please login again.",
            timestamp=datetime.now(timezone.utc)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


@router.get("/sessions", response_model=UserSessionsResponse)
async def get_user_sessions(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user's active sessions.
    
    Returns information about all active sessions for the current user.
    """
    try:
        sessions = await UserSession.get_user_sessions(str(current_user.id), active_only=True)
        
        session_info = [
            SessionInfo(**session.to_response_dict())
            for session in sessions
        ]
        
        return UserSessionsResponse(
            sessions=session_info,
            total_sessions=len(session_info)
        )
        
    except Exception as e:
        logger.error(f"Get sessions error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user sessions"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    refresh_token_data: RefreshTokenRequest,
    request: Request
):
    """
    Refresh access token using refresh token.
    
    Validates refresh token and issues new access and refresh tokens.
    """
    try:
        refresh_token = refresh_token_data.refresh_token
        
        # Verify refresh token
        try:
            payload = verify_token(refresh_token)
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token"
                )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get user
        user = await User.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Find session with this refresh token
        session = await UserSession.find_by_refresh_token(refresh_token)
        if not session or not session.is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Create new tokens
        new_access_token = create_access_token(
            data={"sub": str(user.id), "username": user.username, "role": user.role.value}
        )
        new_refresh_token = create_refresh_token(
            data={"sub": str(user.id), "username": user.username, "role": user.role.value}
        )
        
        # Update session with new tokens
        await session.update_with_timestamp({
            "session_token": new_access_token,
            "refresh_token": new_refresh_token,
            "last_used_at": datetime.now(timezone.utc)
        })
        
        logger.info(f"Tokens refreshed for user: {user.username}")
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=UserResponse(**user.to_response_dict())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh token"
        )


# Authentication dependencies imported above