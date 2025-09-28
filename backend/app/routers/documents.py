from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from datetime import datetime, timezone
from typing import List, Optional
import uuid
import logging
import os
import hashlib
from pathlib import Path
import aiofiles

from app.models.schemas import (
    DocumentUploadRequest, 
    DocumentAnalysisResponse, 
    DocumentType,
    SuccessResponse,
    ErrorResponse
)
from app.models.document import FinancialDocument, DocumentStatus
from app.models.user import User
from app.dependencies import get_logger
from app.middleware.auth import get_current_active_user
from app.config import settings
from app.utils.file_validator import (
    comprehensive_file_validation,
    FileValidationError,
    MaliciousFileError
)

router = APIRouter(prefix="/documents", tags=["documents"])

# Configure logging
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[DocumentAnalysisResponse])
async def list_documents(
    current_user: User = Depends(get_current_active_user),
    limit: int = 50,
    skip: int = 0,
    document_type: Optional[DocumentType] = None,
    include_archived: bool = False,
    logger=Depends(get_logger)
):
    """
    List user's documents with pagination and filtering.
    """
    logger.info(f"List documents requested by user {current_user.id}")
    
    try:
        # Get documents from database
        documents = await FinancialDocument.find_by_user(
            user_id=str(current_user.id),
            document_type=document_type,
            include_archived=include_archived,
            limit=limit,
            skip=skip
        )
        
        # Convert to response format
        response_documents = []
        for doc in documents:
            response_documents.append(
                DocumentAnalysisResponse(
                    document_id=str(doc.id),
                    filename=doc.filename,
                    document_type=doc.document_type,
                    analysis_results=doc.analysis_results or {},
                    confidence_score=doc.confidence_score or 0.0,
                    processed_at=doc.processing_completed_at.isoformat() if doc.processing_completed_at else doc.created_at.isoformat(),
                    status=doc.status.value,
                    is_password_protected=doc.is_password_protected
                )
            )
        
        logger.info(f"Returning {len(response_documents)} documents for user {current_user.id}")
        return response_documents
        
    except Exception as e:
        logger.error(f"Error listing documents for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents"
        )


@router.post("/upload", response_model=DocumentAnalysisResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: DocumentType = DocumentType.OTHER,
    description: str = None,
    password: str = None,
    current_user: User = Depends(get_current_active_user),
    logger=Depends(get_logger)
):
    """
    Upload a PDF document for analysis.
    
    Security Features:
    - Only PDF files allowed
    - 100MB size limit
    - Malicious content detection
    - File signature validation
    - PDF structure validation
    - Password-protected PDF support
    """
    logger.info(f"Document upload requested: {file.filename} by user {current_user.id}")
    
    # Read file content once
    file_content = await file.read()
    
    # Comprehensive security validation
    try:
        max_file_size = settings.max_file_size_mb * 1024 * 1024  # Convert MB to bytes
        
        if settings.skip_file_validation:
            # Development mode - minimal validation
            logger.info("File validation skipped for development")
            if len(file_content) > max_file_size:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File too large (max {settings.max_file_size_mb}MB)"
                )
            file_hash = hashlib.sha256(file_content).hexdigest()
            is_password_protected = False  # Skip password check in dev mode
        else:
            # Production mode - full validation
            is_valid, file_hash, is_password_protected = comprehensive_file_validation(
                file_content=file_content,
                filename=file.filename,
                max_size_bytes=max_file_size,
                strict_validation=settings.strict_pdf_validation,
                password=password
            )
            
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File validation failed"
                )
            
    except FileValidationError as e:
        logger.warning(f"File validation failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except MaliciousFileError as e:
        logger.error(f"Malicious file detected for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security violation: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected validation error for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File validation failed due to server error"
        )
    
    try:
        # File hash already calculated in validation step
        
        # Check for duplicate files
        existing_doc = await FinancialDocument.find_one(
            FinancialDocument.file_hash == file_hash,
            FinancialDocument.user_id == str(current_user.id)
        )
        
        if existing_doc:
            logger.warning(f"Duplicate file detected for user {current_user.id}: {file.filename}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This file has already been uploaded"
            )
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path(settings.upload_directory)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file to disk
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        # Create database record
        document = FinancialDocument(
            filename=file.filename,
            original_filename=file.filename,
            document_type=document_type,
            description=description,
            user_id=str(current_user.id),
            file_path=str(file_path),
            file_size=len(file_content),
            file_hash=file_hash,
            mime_type=file.content_type or "application/pdf",
            status=DocumentStatus.UPLOADED,
            is_password_protected=is_password_protected,
            password_required=is_password_protected
        )
        
        # Save to database
        await document.save()
        
        logger.info(f"Document {document.id} uploaded successfully by user {current_user.id}")
        
        # Return document analysis response
        return DocumentAnalysisResponse(
            document_id=str(document.id),
            filename=document.filename,
            document_type=document.document_type,
            analysis_results={"status": "uploaded", "message": "Document uploaded successfully. Analysis will begin shortly."},
            confidence_score=0.0,
            processed_at=document.created_at.isoformat(),
            status=document.status.value,
            is_password_protected=document.is_password_protected
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        
        # Clean up file if it was created
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as cleanup_error:
                logger.error(f"Failed to cleanup file {file_path}: {cleanup_error}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@router.get("/{document_id}", response_model=DocumentAnalysisResponse)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    logger=Depends(get_logger)
):
    """
    Get analysis results for a specific document.
    """
    logger.info(f"Get document requested: {document_id} by user {current_user.id}")
    
    try:
        # Get document from database
        document = await FinancialDocument.get(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document (or is admin)
        if document.user_id != str(current_user.id) and not current_user.is_admin():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return DocumentAnalysisResponse(
            document_id=str(document.id),
            filename=document.filename,
            document_type=document.document_type,
            analysis_results=document.analysis_results or {},
            confidence_score=document.confidence_score or 0.0,
            processed_at=document.processing_completed_at.isoformat() if document.processing_completed_at else document.created_at.isoformat(),
            status=document.status.value,
            is_password_protected=document.is_password_protected
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document"
        )


@router.delete("/{document_id}", response_model=SuccessResponse)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    logger=Depends(get_logger)
):
    """
    Delete a document and its analysis results.
    """
    logger.info(f"Delete document requested: {document_id} by user {current_user.id}")
    
    try:
        # Get document from database
        document = await FinancialDocument.get(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document (or is admin)
        if document.user_id != str(current_user.id) and not current_user.is_admin():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Delete physical file
        try:
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
                logger.info(f"Deleted file: {document.file_path}")
        except Exception as file_error:
            logger.warning(f"Failed to delete file {document.file_path}: {file_error}")
            # Continue with database deletion even if file deletion fails
        
        # Delete from database
        await document.delete()
        
        logger.info(f"Document {document_id} deleted successfully")
        
        return SuccessResponse(
            message=f"Document {document.filename} deleted successfully",
            timestamp=datetime.now(timezone.utc)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )