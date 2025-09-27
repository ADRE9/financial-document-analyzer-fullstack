"""
Test authentication router without database dependency.

This module contains simplified authentication endpoints for testing without database.
"""

import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any

from app.models.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    SuccessResponse
)
from app.utils.password import get_password_hash, verify_password
from app.utils.jwt import create_access_token, create_refresh_token

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/auth-test", tags=["authentication-test"])

# In-memory storage for testing (replace with database in production)
test_users: Dict[str, Dict[str, Any]] = {}
test_sessions: Dict[str, Dict[str, Any]] = {}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user_test(user_data: UserRegisterRequest):
    """
    Register a new user (test version without database).
    """
    try:
        # Check if username already exists
        if user_data.username in test_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        for user in test_users.values():
            if user["email"] == user_data.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user_id = len(test_users) + 1
        user = {
            "id": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "hashed_password": hashed_password,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "is_active": True,
            "is_verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        test_users[user_data.username] = user
        
        logger.info(f"Test user registered successfully: {user_data.username}")
        
        return UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            is_active=user["is_active"],
            is_verified=user["is_verified"],
            created_at=user["created_at"],
            updated_at=user["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Test user registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
async def login_user_test(login_data: UserLoginRequest):
    """
    Login user and return JWT tokens (test version without database).
    """
    try:
        # Find user by email
        user = None
        for u in test_users.values():
            if u["email"] == login_data.email:
                user = u
                break
        
        if not user or not verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create tokens
        access_token = create_access_token(data={"sub": str(user["id"])})
        refresh_token = create_refresh_token(data={"sub": str(user["id"])})
        
        # Store session
        session_id = len(test_sessions) + 1
        test_sessions[access_token] = {
            "id": session_id,
            "user_id": user["id"],
            "session_token": access_token,
            "refresh_token": refresh_token,
            "is_active": True,
            "expires_at": datetime.utcnow() + timedelta(minutes=30)
        }
        
        logger.info(f"Test user logged in successfully: {user['username']}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=30 * 60,  # 30 minutes in seconds
            user=UserResponse(
                id=user["id"],
                username=user["username"],
                email=user["email"],
                first_name=user["first_name"],
                last_name=user["last_name"],
                is_active=user["is_active"],
                is_verified=user["is_verified"],
                created_at=user["created_at"],
                updated_at=user["updated_at"]
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Test user login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.get("/test-protected", response_model=SuccessResponse)
async def test_protected_route():
    """
    Test protected route that doesn't require authentication.
    """
    return SuccessResponse(
        message="This is a test protected route that works without authentication",
        data={
            "test": True,
            "timestamp": datetime.utcnow().isoformat()
        },
        timestamp=datetime.utcnow()
    )
