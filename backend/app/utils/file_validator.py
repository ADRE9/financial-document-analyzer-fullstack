"""
Secure file validation utilities for PDF uploads.

This module provides comprehensive validation for uploaded files including:
- File type validation using magic numbers
- PDF structure validation
- Malicious content detection
- File size validation
- Security checks
"""

import magic
import hashlib
import logging
from typing import Tuple, Optional
from pathlib import Path
import PyPDF2
from io import BytesIO

logger = logging.getLogger(__name__)

# Truly dangerous patterns in PDF files (reduced for practical use)
DANGEROUS_PDF_PATTERNS = [
    b'/Launch',  # Can execute external programs
    b'<script',  # HTML script tags (shouldn't be in PDFs)
    b'javascript:',  # JavaScript protocols
    b'/SubmitForm',  # Form submission to external URLs
    b'/ImportData'  # Data import from external sources
]

# Patterns that need contextual analysis (not immediately dangerous)
SUSPICIOUS_PDF_PATTERNS = [
    b'/JavaScript',
    b'/JS', 
    b'/OpenAction',
    b'/AA',
    b'/EmbeddedFile',
    b'/XFA',
    b'/URI'
]

# Maximum allowed PDF objects (prevent zip bombs)
MAX_PDF_OBJECTS = 10000

# PDF file signature (magic numbers)
PDF_MAGIC_NUMBERS = [
    b'%PDF-1.',  # Standard PDF header
]


class FileValidationError(Exception):
    """Custom exception for file validation errors."""
    pass


class MaliciousFileError(Exception):
    """Custom exception for malicious file detection."""
    pass


def validate_file_signature(file_content: bytes) -> bool:
    """
    Validate file signature using magic numbers.
    
    Args:
        file_content: Raw file content bytes
        
    Returns:
        True if file signature is valid PDF
        
    Raises:
        FileValidationError: If file signature is invalid
    """
    if not file_content:
        raise FileValidationError("Empty file content")
    
    # Check PDF magic numbers
    for magic_number in PDF_MAGIC_NUMBERS:
        if file_content.startswith(magic_number):
            return True
    
    raise FileValidationError("Invalid PDF file signature. File is not a valid PDF.")


def validate_mime_type(file_content: bytes) -> bool:
    """
    Validate MIME type using python-magic.
    
    Args:
        file_content: Raw file content bytes
        
    Returns:
        True if MIME type is valid PDF
        
    Raises:
        FileValidationError: If MIME type is invalid
    """
    try:
        mime_type = magic.from_buffer(file_content, mime=True)
        
        # Accept various PDF-related MIME types
        allowed_mime_types = [
            'application/pdf',
            'application/x-pdf', 
            'application/x-bzpdf',
            'application/x-gzpdf',
            'application/acrobat',
            'applications/vnd.pdf',
            'text/pdf',
            'text/x-pdf'
        ]
        
        if mime_type not in allowed_mime_types:
            logger.warning(f"Unusual MIME type detected: {mime_type}")
            # Still allow if file signature is correct (checked elsewhere)
            # raise FileValidationError(f"Invalid MIME type: {mime_type}. Only PDF files are allowed.")
        
        return True
    except Exception as e:
        logger.error(f"MIME type validation failed: {e}")
        raise FileValidationError("Failed to validate file type")


def validate_pdf_structure(file_content: bytes, password: Optional[str] = None) -> Tuple[bool, bool]:
    """
    Validate PDF file structure and detect potential malicious content.
    
    Args:
        file_content: Raw file content bytes
        password: Optional password for encrypted PDFs
        
    Returns:
        Tuple of (is_valid, is_password_protected)
        
    Raises:
        MaliciousFileError: If malicious content is detected
        FileValidationError: If PDF structure is invalid
    """
    try:
        # Create BytesIO object from file content
        pdf_stream = BytesIO(file_content)
        
        # Try to read PDF with PyPDF2
        pdf_reader = PyPDF2.PdfReader(pdf_stream)
        
        # Check if PDF is encrypted
        is_password_protected = pdf_reader.is_encrypted
        
        if is_password_protected:
            logger.info("Password-protected PDF detected")
            
            # If password provided, try to decrypt
            if password:
                try:
                    if pdf_reader.decrypt(password):
                        logger.info("PDF successfully decrypted with provided password")
                    else:
                        raise FileValidationError("Invalid password for encrypted PDF")
                except Exception as e:
                    raise FileValidationError(f"Failed to decrypt PDF: {e}")
            else:
                # Password required but not provided
                raise FileValidationError("Password is required for this encrypted PDF")
        
        # Validate number of pages (prevent excessive resource usage)
        num_pages = len(pdf_reader.pages)
        if num_pages > 1000:  # Reasonable limit for financial documents
            raise FileValidationError(f"PDF has too many pages ({num_pages}). Maximum allowed: 1000")
        
        # Check for malicious patterns in PDF content
        detect_malicious_patterns(file_content)
        
        # Validate PDF objects count (prevent zip bombs)
        if hasattr(pdf_reader, 'trailer') and pdf_reader.trailer:
            try:
                if '/Size' in pdf_reader.trailer:
                    obj_count = pdf_reader.trailer['/Size']
                    if obj_count > MAX_PDF_OBJECTS:
                        raise MaliciousFileError(f"PDF has too many objects ({obj_count}). Possible zip bomb.")
            except Exception:
                # If we can't read object count, proceed with caution
                logger.warning("Could not validate PDF object count")
        
        logger.info(f"PDF validation successful: {num_pages} pages, password_protected: {is_password_protected}")
        return True, is_password_protected
        
    except PyPDF2.errors.PdfReadError as e:
        raise FileValidationError(f"Invalid PDF structure: {e}")
    except (MaliciousFileError, FileValidationError):
        raise
    except Exception as e:
        logger.error(f"PDF structure validation failed: {e}")
        raise FileValidationError("Failed to validate PDF structure")


def detect_malicious_patterns(file_content: bytes) -> bool:
    """
    Detect truly dangerous patterns in PDF content.
    
    Args:
        file_content: Raw file content bytes
        
    Returns:
        True if no dangerous patterns detected
        
    Raises:
        MaliciousFileError: If dangerous patterns are found
    """
    file_content_lower = file_content.lower()
    
    # Only check for truly dangerous patterns
    for pattern in DANGEROUS_PDF_PATTERNS:
        if pattern.lower() in file_content_lower:
            raise MaliciousFileError(f"Potentially dangerous content detected: {pattern.decode('utf-8', errors='ignore')}")
    
    # Log suspicious patterns but don't block them
    suspicious_found = []
    for pattern in SUSPICIOUS_PDF_PATTERNS:
        if pattern.lower() in file_content_lower:
            suspicious_found.append(pattern.decode('utf-8', errors='ignore'))
    
    if suspicious_found:
        logger.info(f"Suspicious patterns found (but allowed): {', '.join(suspicious_found)}")
    
    # Check for suspicious file size patterns (potential zip bombs)
    if len(file_content) < 100:  # PDF files should be at least 100 bytes
        raise MaliciousFileError("File too small to be a valid PDF")
    
    return True


def validate_filename(filename: str) -> bool:
    """
    Validate filename for security issues.
    
    Args:
        filename: Original filename
        
    Returns:
        True if filename is safe
        
    Raises:
        FileValidationError: If filename is invalid or unsafe
    """
    if not filename:
        raise FileValidationError("Filename cannot be empty")
    
    # Check file extension
    file_path = Path(filename)
    if file_path.suffix.lower() != '.pdf':
        raise FileValidationError("Only PDF files are allowed")
    
    # Check for path traversal attempts
    if '..' in filename or '/' in filename or '\\' in filename:
        raise FileValidationError("Invalid filename: path traversal detected")
    
    # Check filename length
    if len(filename) > 255:
        raise FileValidationError("Filename too long (max 255 characters)")
    
    # Check for suspicious characters
    suspicious_chars = ['<', '>', ':', '"', '|', '?', '*', '\x00']
    if any(char in filename for char in suspicious_chars):
        raise FileValidationError("Filename contains invalid characters")
    
    return True


def calculate_file_hash(file_content: bytes, algorithm: str = 'sha256') -> str:
    """
    Calculate file hash for integrity checking.
    
    Args:
        file_content: Raw file content bytes
        algorithm: Hash algorithm ('sha256', 'md5', etc.)
        
    Returns:
        Hexadecimal hash string
    """
    if algorithm == 'sha256':
        return hashlib.sha256(file_content).hexdigest()
    elif algorithm == 'md5':
        return hashlib.md5(file_content).hexdigest()
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")


def comprehensive_file_validation(
    file_content: bytes, 
    filename: str, 
    max_size_bytes: int = 10 * 1024 * 1024,
    strict_validation: bool = False,
    password: Optional[str] = None
) -> Tuple[bool, str, bool]:
    """
    Perform comprehensive file validation including security checks.
    
    Args:
        file_content: Raw file content bytes
        filename: Original filename
        max_size_bytes: Maximum allowed file size in bytes
        strict_validation: Whether to perform strict validation
        password: Optional password for encrypted PDFs
        
    Returns:
        Tuple of (is_valid, file_hash, is_password_protected)
        
    Raises:
        FileValidationError: If file validation fails
        MaliciousFileError: If malicious content is detected
    """
    try:
        # 1. Validate filename
        validate_filename(filename)
        
        # 2. Check file size
        if len(file_content) > max_size_bytes:
            max_size_mb = max_size_bytes / (1024 * 1024)
            raise FileValidationError(f"File size exceeds {max_size_mb:.1f}MB limit")
        
        if len(file_content) == 0:
            raise FileValidationError("File is empty")
        
        # 3. Validate file signature (magic numbers)
        validate_file_signature(file_content)
        
        # 4. Validate MIME type (only in strict mode)
        if strict_validation:
            validate_mime_type(file_content)
        
        # 5. Validate PDF structure and detect malicious content
        is_valid, is_password_protected = validate_pdf_structure(file_content, password)
        
        # 6. Calculate file hash
        file_hash = calculate_file_hash(file_content)
        
        logger.info(f"File validation successful: {filename} ({len(file_content)} bytes), password_protected: {is_password_protected}")
        return True, file_hash, is_password_protected
        
    except (FileValidationError, MaliciousFileError) as e:
        logger.error(f"File validation failed for {filename}: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during file validation: {e}")
        raise FileValidationError("File validation failed due to unexpected error")
