"""
Password hashing and verification utilities.

This module provides secure password hashing and verification functions using bcrypt.
Follows FastAPI recommended patterns for secure password handling.

Uses a two-stage hashing approach:
1. Pre-hash with SHA-256 to eliminate bcrypt's 72-byte limit
2. Hash the digest with bcrypt for security

This approach is recommended for handling long passwords while maintaining
bcrypt's security benefits.
"""

import hashlib
import logging
import bcrypt

# Configure logging
logger = logging.getLogger(__name__)


def _prepare_password(password: str) -> bytes:
    """
    Prepare password for bcrypt hashing.
    
    Pre-hashes the password with SHA-256 to avoid bcrypt's 72-byte limit.
    This allows passwords of any length while maintaining security.
    
    Args:
        password: The plain text password
        
    Returns:
        bytes: The prepared password bytes ready for bcrypt
    """
    # Pre-hash with SHA-256 to eliminate the 72-byte limit
    # This is a recommended approach for handling long passwords with bcrypt
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return password_hash.encode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash.
    
    Uses bcrypt with SHA-256 pre-hashing for security and compatibility.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The bcrypt hashed password to verify against
        
    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        prepared_password = _prepare_password(plain_password)
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(prepared_password, hashed_bytes)
    except Exception as e:
        logger.error(f"Password verification failed: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt with SHA-256 pre-hashing.
    
    Two-stage approach:
    1. Pre-hash with SHA-256 to handle passwords of any length
    2. Hash the digest with bcrypt for security
    
    This eliminates bcrypt's 72-byte limit while maintaining strong security.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        str: The bcrypt hashed password
        
    Raises:
        ValueError: If password hashing fails
    """
    try:
        prepared_password = _prepare_password(password)
        # Generate salt and hash with bcrypt
        salt = bcrypt.gensalt(rounds=12)  # 12 rounds is a good balance of security and performance
        hashed = bcrypt.hashpw(prepared_password, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing failed: {e}")
        raise ValueError("Failed to hash password")


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength requirements.
    
    With SHA-256 pre-hashing, we can accept passwords of any reasonable length
    without bcrypt's 72-byte limitation.
    
    Args:
        password: The password to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    import re
    
    # Minimum length requirement
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    # Maximum length for practical purposes (no hard bcrypt limit anymore)
    if len(password) > 128:
        return False, "Password must be at most 128 characters long"
    
    # Check for character requirements
    has_upper = bool(re.search(r'[A-Z]', password))
    has_lower = bool(re.search(r'[a-z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]', password))
    
    if not has_upper:
        return False, "Password must contain at least one uppercase letter"
    
    if not has_lower:
        return False, "Password must contain at least one lowercase letter"
    
    if not has_digit:
        return False, "Password must contain at least one number"
    
    if not has_special:
        return False, "Password must contain at least one special character"
    
    return True, ""
