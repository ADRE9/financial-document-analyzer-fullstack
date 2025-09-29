from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import uuid
import logging
import os
import hashlib
from pathlib import Path
import aiofiles
import asyncio
import sys

from app.models.schemas import (
    DocumentUploadRequest, 
    DocumentAnalysisResponse, 
    DocumentType,
    SuccessResponse,
    ErrorResponse
)
from app.models.document import FinancialDocument, DocumentStatus
from app.models.user import User
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

# Import CrewAI for analysis
crew_path = Path(__file__).parent.parent.parent / "financial_document_analyzer_crew" / "src"
sys.path.insert(0, str(crew_path))

try:
    from financial_document_analyzer_crew.main import run as run_crew
except ImportError as e:
    logger.warning(f"CrewAI not available: {e}")
    run_crew = None


@router.get("/", response_model=List[DocumentAnalysisResponse])
async def list_documents(
    current_user: User = Depends(get_current_active_user),
    limit: int = 50,
    skip: int = 0,
    document_type: Optional[DocumentType] = None,
    include_archived: bool = False
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
    auto_analyze: bool = False,
    analysis_query: str = "Provide a comprehensive financial analysis of this document",
    current_user: User = Depends(get_current_active_user)
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
    
    Args:
        file: The PDF file to upload
        document_type: Type of the document
        description: Optional description
        password: Password for password-protected PDFs
        auto_analyze: If True, automatically trigger CrewAI analysis after upload
        analysis_query: Query to use for analysis if auto_analyze is True
        current_user: Authenticated user
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
        
        # Auto-analyze if requested
        if auto_analyze and run_crew:
            try:
                logger.info(f"Starting automatic analysis for document {document.id}")
                
                # Mark document as processing
                await document.start_processing()
                
                # Run crew analysis
                def run_analysis():
                    return run_crew(
                        document_path=document.file_path,
                        query=analysis_query
                    )
                
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, run_analysis)
                
                # Process the result
                analysis_results = {}
                confidence_score = 0.85
                
                if isinstance(result, str):
                    if "VALIDATION_FAILED" in result:
                        await document.fail_processing("Document is not a valid financial document")
                        analysis_results = {"status": "failed", "error": "Not a financial document"}
                    else:
                        analysis_results = {"raw_output": result}
                elif hasattr(result, 'raw'):
                    raw_output = result.raw
                    if "VALIDATION_FAILED" in raw_output:
                        await document.fail_processing("Document is not a valid financial document")
                        analysis_results = {"status": "failed", "error": "Not a financial document"}
                    else:
                        analysis_results = {"raw_output": raw_output}
                        if hasattr(result, 'json_dict') and result.json_dict:
                            analysis_results["structured_data"] = result.json_dict
                elif isinstance(result, dict):
                    analysis_results = result
                else:
                    analysis_results = {"result": str(result)}
                
                # Mark processing as complete if not failed
                if document.status != DocumentStatus.FAILED:
                    await document.complete_processing(
                        analysis_results=analysis_results,
                        confidence_score=confidence_score
                    )
                    logger.info(f"Automatic analysis completed for document {document.id}")
                
            except Exception as analysis_error:
                logger.error(f"Auto-analysis failed for document {document.id}: {analysis_error}")
                await document.fail_processing(str(analysis_error))
                # Don't raise error - upload succeeded even if analysis failed
        
        # Refresh document from database to get latest state
        document = await FinancialDocument.find_by_id(str(document.id))
        
        # Return document analysis response
        return DocumentAnalysisResponse(
            document_id=str(document.id),
            filename=document.filename,
            document_type=document.document_type,
            analysis_results=document.analysis_results or {"status": "uploaded", "message": "Document uploaded successfully."},
            confidence_score=document.confidence_score or 0.0,
            processed_at=document.processing_completed_at.isoformat() if document.processing_completed_at else document.created_at.isoformat(),
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
    current_user: User = Depends(get_current_active_user)
):
    """
    Get analysis results for a specific document.
    """
    logger.info(f"Get document requested: {document_id} by user {current_user.id}")
    
    try:
        # Get document from database
        document = await FinancialDocument.find_by_id(document_id)
        
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


@router.post("/{document_id}/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(
    document_id: str,
    query: str = "Provide a comprehensive financial analysis of this document",
    current_user: User = Depends(get_current_active_user)
):
    """
    Trigger CrewAI analysis on an uploaded document.
    
    Args:
        document_id: ID of the document to analyze
        query: Analysis query (default: comprehensive financial analysis)
        current_user: Authenticated user
        
    Returns:
        Updated document with analysis results
    """
    logger.info(f"Document analysis requested: {document_id} by user {current_user.id}")
    
    try:
        # Get document from database
        document = await FinancialDocument.find_by_id(document_id)
        
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
        
        # Check if CrewAI is available
        if not run_crew:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="CrewAI analysis service is not available"
            )
        
        # Check if document file exists
        if not os.path.exists(document.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document file not found on server"
            )
        
        # Mark document as processing
        await document.start_processing()
        
        try:
            # Run crew analysis in background
            def run_analysis():
                return run_crew(
                    document_path=document.file_path,
                    query=query
                )
            
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, run_analysis)
            
            # Process the result
            analysis_results = {}
            confidence_score = 0.85  # Default confidence
            extracted_text = None
            
            if isinstance(result, str):
                # Check for validation failure
                if "VALIDATION_FAILED" in result:
                    await document.fail_processing("Document is not a valid financial document")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Document validation failed: Not a financial document"
                    )
                # Store raw output
                analysis_results = {"raw_output": result}
            elif hasattr(result, 'raw'):
                # CrewOutput object
                raw_output = result.raw
                if "VALIDATION_FAILED" in raw_output:
                    await document.fail_processing("Document is not a valid financial document")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Document validation failed: Not a financial document"
                    )
                analysis_results = {"raw_output": raw_output}
                
                # Try to extract structured data if available
                if hasattr(result, 'json_dict') and result.json_dict:
                    analysis_results["structured_data"] = result.json_dict
            elif isinstance(result, dict):
                analysis_results = result
            else:
                analysis_results = {"result": str(result)}
            
            # Mark processing as complete
            await document.complete_processing(
                analysis_results=analysis_results,
                confidence_score=confidence_score,
                extracted_text=extracted_text
            )
            
            logger.info(f"Document {document_id} analyzed successfully")
            
            return DocumentAnalysisResponse(
                document_id=str(document.id),
                filename=document.filename,
                document_type=document.document_type,
                analysis_results=analysis_results,
                confidence_score=confidence_score,
                processed_at=document.processing_completed_at.isoformat(),
                status=document.status.value,
                is_password_protected=document.is_password_protected
            )
            
        except Exception as analysis_error:
            # Mark processing as failed
            error_msg = str(analysis_error)
            await document.fail_processing(error_msg)
            logger.error(f"Analysis failed for document {document_id}: {error_msg}")
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Analysis failed: {error_msg}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze document"
        )


@router.delete("/{document_id}", response_model=SuccessResponse)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a document and its analysis results.
    """
    logger.info(f"Delete document requested: {document_id} by user {current_user.id}")
    
    try:
        # Get document from database
        document = await FinancialDocument.find_by_id(document_id)
        
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