"""
OAuth2 Authentication router following FastAPI OAuth2 with Password (and hashing) pattern.

This module implements the standard FastAPI OAuth2 authentication pattern
as documented in https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.models.user import User
from app.models.schemas import UserResponse
from app.utils.password import verify_password, get_password_hash
from app.utils.jwt import create_access_token, verify_token

# Configure logging
logger = logging.getLogger(__name__)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="oauth2/token")

router = APIRouter(prefix="/oauth2", tags=["oauth2-authentication"])


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


async def get_user(username: str) -> Optional[User]:
    """
    Get user by username from database.
    
    Args:
        username: The username to search for
        
    Returns:
        User: The user if found, None otherwise
    """
    try:
        user = await User.find_by_username(username)
        return user
    except Exception as e:
        logger.error(f"Error getting user {username}: {e}")
        return None


async def authenticate_user(username: str, password: str) -> Optional[User]:
    """
    Authenticate user with username and password.
    
    Args:
        username: The username
        password: The plain text password
        
    Returns:
        User: The authenticated user if valid, None otherwise
    """
    user = await get_user(username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Get current user from JWT token.
    
    Args:
        token: The JWT token
        
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
        payload = verify_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except Exception:
        raise credentials_exception
    
    user = await get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current active user.
    
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


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login endpoint that returns access token.
    
    This follows the FastAPI OAuth2 with Password pattern exactly.
    """
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)  # 30 minutes
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user information.
    
    This is a protected endpoint that requires authentication.
    """
    return UserResponse(**current_user.to_response_dict())


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegister):
    """
    Register a new user.
    
    This is a simplified registration endpoint for the OAuth2 pattern.
    """
    logger.info(f"User registration attempt for username: {user_data.username}")
    
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
            is_active=True,
            is_verified=False
        )
        
        await new_user.save()
        logger.info(f"User created successfully: {new_user.username} (ID: {new_user.id})")
        
        return UserResponse(**new_user.to_response_dict())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )
