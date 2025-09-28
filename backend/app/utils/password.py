"""
Password hashing and verification utilities.

This module provides secure password hashing and verification functions using bcrypt.
"""

import logging
from passlib.context import CryptContext

# Configure logging
logger = logging.getLogger(__name__)

# Create password context with bcrypt (recommended by FastAPI)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to verify against
        
    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        # Apply the same truncation logic as in get_password_hash
        # to ensure consistency between hashing and verification
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            # Apply the same truncation logic as in get_password_hash
            truncated_password = password_bytes[:72].decode('utf-8', errors='ignore')
            
            # If the truncated password is empty or too short, try to find a valid boundary
            if len(truncated_password) < 4:  # Minimum reasonable password length
                # Work backwards from 72 bytes to find a valid UTF-8 boundary
                for i in range(72, 0, -1):
                    try:
                        test_password = password_bytes[:i].decode('utf-8')
                        if len(test_password) >= 4:  # Ensure we have a reasonable password
                            truncated_password = test_password
                            break
                    except UnicodeDecodeError:
                        continue
                else:
                    # If we can't find a valid boundary, use the first 72 bytes with replacement
                    truncated_password = password_bytes[:72].decode('utf-8', errors='replace')
            
            plain_password = truncated_password
        
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification failed: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        str: The hashed password
    """
    try:
        # bcrypt has a 72-byte limit, so we need to truncate if necessary
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            # Truncate to 72 bytes, but ensure we don't break UTF-8 characters
            # Find the last complete UTF-8 character boundary within 72 bytes
            truncated_password = password_bytes[:72].decode('utf-8', errors='ignore')
            
            # If the truncated password is empty or too short, try to find a valid boundary
            if len(truncated_password) < 4:  # Minimum reasonable password length
                # Work backwards from 72 bytes to find a valid UTF-8 boundary
                for i in range(72, 0, -1):
                    try:
                        test_password = password_bytes[:i].decode('utf-8')
                        if len(test_password) >= 4:  # Ensure we have a reasonable password
                            truncated_password = test_password
                            break
                    except UnicodeDecodeError:
                        continue
                else:
                    # If we can't find a valid boundary, use the first 72 bytes with replacement
                    truncated_password = password_bytes[:72].decode('utf-8', errors='replace')
            
            password = truncated_password
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing failed: {e}")
        raise ValueError("Failed to hash password")


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength requirements.
    
    Args:
        password: The password to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 20:
        return False, "Password must be at most 20 characters long"
    
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
