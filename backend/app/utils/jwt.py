"""
JWT token management utilities following FastAPI OAuth2 with Password (and hashing) pattern.

This module provides JWT token creation, verification, and management functions
following the FastAPI documentation recommendations.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# JWT settings
ALGORITHM = settings.algorithm
SECRET_KEY = settings.secret_key
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = settings.refresh_token_expire_days


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token following FastAPI OAuth2 pattern.
    
    Args:
        data: The data to encode in the token
        expires_delta: Optional expiration time override
        
    Returns:
        str: The encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Failed to create access token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create access token"
        )


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT refresh token.
    
    Args:
        data: The data to encode in the token
        
    Returns:
        str: The encoded JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Failed to create refresh token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create refresh token"
        )


def verify_token(token: str, token_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Verify and decode a JWT token following FastAPI OAuth2 pattern.
    
    Args:
        token: The JWT token to verify
        token_type: Optional token type to validate ("access" or "refresh")
        
    Returns:
        Dict: The decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Check token type if specified
        if token_type == "refresh":
            if payload.get("type") != "refresh":
                raise credentials_exception
        elif token_type == "access":
            # Access tokens should not have a type field or should be "access"
            token_type_field = payload.get("type")
            if token_type_field is not None and token_type_field != "access":
                raise credentials_exception
        
        return payload
    except JWTError:
        raise credentials_exception


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode a JWT token without verification (for debugging).
    
    Args:
        token: The JWT token to decode
        
    Returns:
        Dict: The decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT decode failed: {e}")
        return None


def get_token_expiration(token: str) -> Optional[datetime]:
    """
    Get the expiration time of a JWT token.
    
    Args:
        token: The JWT token
        
    Returns:
        datetime: The expiration time or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        if exp:
            return datetime.fromtimestamp(exp)
        return None
    except JWTError:
        return None


def is_token_expired(token: str) -> bool:
    """
    Check if a JWT token is expired.
    
    Args:
        token: The JWT token to check
        
    Returns:
        bool: True if expired, False otherwise
    """
    exp_time = get_token_expiration(token)
    if exp_time is None:
        return True
    return datetime.now(timezone.utc) > exp_time
