from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from datetime import datetime
from typing import List
import uuid
import logging

from app.models.schemas import (
    DocumentUploadRequest, 
    DocumentAnalysisResponse, 
    DocumentType,
    SuccessResponse,
    ErrorResponse
)
from app.dependencies import get_logger

router = APIRouter(prefix="/documents", tags=["documents"])

# Configure logging
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[DocumentAnalysisResponse])
async def list_documents(logger=Depends(get_logger)):
    """
    List all analyzed documents.
    """
    logger.info("List documents requested")
    
    # TODO: Implement actual document listing from database
    # For now, return mock data
    mock_documents = [
        DocumentAnalysisResponse(
            document_id=str(uuid.uuid4()),
            filename="sample_invoice.pdf",
            document_type=DocumentType.INVOICE,
            analysis_results={
                "total_amount": 1250.50,
                "vendor": "Sample Company Inc.",
                "date": "2024-01-15",
                "items": ["Service Fee", "Consulting"]
            },
            confidence_score=0.95,
            processed_at=datetime.utcnow(),
            status="completed"
        )
    ]
    
    return mock_documents


@router.post("/upload", response_model=SuccessResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: DocumentType = DocumentType.OTHER,
    description: str = None,
    logger=Depends(get_logger)
):
    """
    Upload a document for analysis.
    """
    logger.info(f"Document upload requested: {file.filename}")
    
    # Validate file type
    allowed_extensions = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff']
    file_extension = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not supported. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size (10MB limit)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 10MB limit"
        )
    
    # TODO: Implement actual file processing and analysis
    document_id = str(uuid.uuid4())
    
    logger.info(f"Document {document_id} uploaded successfully")
    
    return SuccessResponse(
        message="Document uploaded successfully",
        data={
            "document_id": document_id,
            "filename": file.filename,
            "document_type": document_type,
            "size_bytes": len(file_content)
        },
        timestamp=datetime.utcnow()
    )


@router.get("/{document_id}", response_model=DocumentAnalysisResponse)
async def get_document(
    document_id: str,
    logger=Depends(get_logger)
):
    """
    Get analysis results for a specific document.
    """
    logger.info(f"Get document requested: {document_id}")
    
    # TODO: Implement actual document retrieval from database
    # For now, return mock data
    if not document_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    mock_document = DocumentAnalysisResponse(
        document_id=document_id,
        filename="sample_document.pdf",
        document_type=DocumentType.INVOICE,
        analysis_results={
            "total_amount": 1250.50,
            "vendor": "Sample Company Inc.",
            "date": "2024-01-15",
            "items": ["Service Fee", "Consulting"],
            "extracted_text": "This is a sample invoice...",
            "key_fields": {
                "invoice_number": "INV-2024-001",
                "due_date": "2024-02-15",
                "tax_amount": 125.05
            }
        },
        confidence_score=0.95,
        processed_at=datetime.utcnow(),
        status="completed"
    )
    
    return mock_document


@router.delete("/{document_id}", response_model=SuccessResponse)
async def delete_document(
    document_id: str,
    logger=Depends(get_logger)
):
    """
    Delete a document and its analysis results.
    """
    logger.info(f"Delete document requested: {document_id}")
    
    # TODO: Implement actual document deletion from database
    
    return SuccessResponse(
        message=f"Document {document_id} deleted successfully",
        timestamp=datetime.utcnow()
    )
