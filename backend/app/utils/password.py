"""
Password hashing and verification utilities.

This module provides secure password hashing and verification functions using bcrypt.
Follows FastAPI recommended patterns for secure password handling.
"""

import logging
from passlib.context import CryptContext

# Configure logging
logger = logging.getLogger(__name__)

# Create password context with bcrypt (recommended by FastAPI)
# Using the exact pattern from FastAPI documentation
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash.
    
    FastAPI recommended approach using PassLib with bcrypt.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to verify against
        
    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification failed: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    FastAPI recommended approach using PassLib with bcrypt.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        str: The hashed password
        
    Raises:
        ValueError: If password hashing fails
    """
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing failed: {e}")
        raise ValueError("Failed to hash password")


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength requirements.
    
    Validates length and complexity while ensuring compatibility with bcrypt's 72-byte limit.
    
    Args:
        password: The password to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    # Limit to 72 characters to prevent bcrypt issues
    # This is safe since bcrypt truncates at 72 bytes anyway
    if len(password) > 72:
        return False, "Password must be at most 72 characters long"
    
    # Check for alphanumeric and special characters
    import re
    has_alpha = bool(re.search(r'[a-zA-Z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
    
    if not has_alpha:
        return False, "Password must contain at least one letter"
    
    if not has_digit:
        return False, "Password must contain at least one number"
    
    if not has_special:
        return False, "Password must contain at least one special character"
    
    return True, ""
