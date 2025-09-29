"""
Financial Document Analysis Crew API Router

This module provides endpoints for running CrewAI financial document analysis.
"""

import os
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any
import asyncio
import json

# Add the crew directory to Python path
crew_path = Path(__file__).parent.parent.parent / "financial_document_analyzer_crew" / "src"
sys.path.insert(0, str(crew_path))

try:
    from financial_document_analyzer_crew.main import run as run_crew
    from financial_document_analyzer_crew.tools import FinancialDocumentTool
except ImportError as e:
    print(f"Warning: CrewAI not available: {e}")
    run_crew = None
    FinancialDocumentTool = None

from ..middleware.auth import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/crew", tags=["crew-analysis"])


class CrewAnalysisRequest(BaseModel):
    """Request model for crew analysis."""
    document_path: str
    query: str


class CrewAnalysisResponse(BaseModel):
    """Response model for crew analysis."""
    status: str
    analysis_result: Dict[Any, Any]
    execution_time: float
    document_validated: bool
    error_message: str = None


async def _run_crew_analysis_internal(document_path: str, query: str) -> dict:
    """
    Internal function to run crew analysis.
    
    Args:
        document_path: Path to the document to analyze
        query: User query for analysis
        
    Returns:
        Analysis results dictionary
        
    Raises:
        HTTPException: If analysis fails or document is invalid
    """
    import time
    start_time = time.time()
    
    # Check if CrewAI is available
    if not run_crew:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CrewAI analysis service is not available. Please check dependencies."
        )
    
    # Validate document path
    if not os.path.exists(document_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document not found at path: {document_path}"
        )
    
    # Run crew analysis in a separate thread to avoid blocking
    def run_analysis():
        return run_crew(
            document_path=document_path,
            query=query
        )
    
    # Execute the crew analysis
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, run_analysis)
    
    execution_time = time.time() - start_time
    
    # Parse the result if it's a string
    if isinstance(result, str):
        try:
            result = json.loads(result)
        except json.JSONDecodeError:
            # Check if it's a validation failure
            if "VALIDATION_FAILED" in result:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Document validation failed: {result}"
                )
            # If it's not JSON, wrap it in a structure
            result = {
                "analysis_output": result,
                "format": "text"
            }
    
    # Check for validation failure in the result
    if isinstance(result, dict):
        # Check if any task output contains validation failure
        task_outputs = result.get("tasks_output", []) if "tasks_output" in result else [result]
        for task_output in task_outputs:
            if isinstance(task_output, dict):
                raw_output = task_output.get("raw", "") or task_output.get("output", "") or str(task_output)
            else:
                raw_output = str(task_output)
            
            if "VALIDATION_FAILED" in raw_output:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Document validation failed: {raw_output}"
                )
    
    # Extract document validation status if available
    document_validated = True  # Default to true if validation passed
    if isinstance(result, dict) and "document_validation" in result:
        document_validated = result["document_validation"].get("is_financial_document", True)
    
    return {
        "status": "success",
        "analysis_result": result,
        "execution_time": execution_time,
        "document_validated": document_validated
    }


@router.post("/analyze", response_model=CrewAnalysisResponse)
async def run_crew_analysis(
    request: CrewAnalysisRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Run CrewAI financial document analysis with authentication.
    
    This endpoint:
    1. Validates the document path exists
    2. Runs the CrewAI analysis workflow
    3. Returns structured analysis results
    
    Args:
        request: Analysis request with document path and query
        current_user: Authenticated user
        
    Returns:
        Analysis results from the CrewAI workflow
    """
    try:
        result = await _run_crew_analysis_internal(
            document_path=request.document_path,
            query=request.query
        )
        return CrewAnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        import time
        return CrewAnalysisResponse(
            status="error",
            analysis_result={},
            execution_time=0.0,
            document_validated=False,
            error_message=f"Analysis service error: {str(e)}"
        )


@router.post("/analyze-test", response_model=CrewAnalysisResponse)
async def run_crew_analysis_test(
    request: CrewAnalysisRequest
):
    """
    TEST ENDPOINT: Run CrewAI financial document analysis without authentication.
    For testing purposes only. Use /analyze endpoint in production.
    
    Args:
        request: Analysis request with document path and query
        
    Returns:
        Analysis results from the CrewAI workflow
    """
    try:
        result = await _run_crew_analysis_internal(
            document_path=request.document_path,
            query=request.query
        )
        return CrewAnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        return CrewAnalysisResponse(
            status="error",
            analysis_result={},
            execution_time=0.0,
            document_validated=False,
            error_message=f"Analysis service error: {str(e)}"
        )


@router.get("/health")
async def crew_health_check():
    """
    Check if CrewAI service is available and properly configured.
    
    Returns:
        Health status of the CrewAI service
    """
    try:
        # Check if CrewAI is importable
        crew_available = run_crew is not None and FinancialDocumentTool is not None
        
        # Check environment variables
        required_env_vars = ["GEMINI_API_KEY", "SERPER_API_KEY"]
        env_status = {}
        
        for var in required_env_vars:
            value = os.getenv(var)
            env_status[var] = {
                "configured": value is not None and value != "",
                "is_dummy": value and "dummy" in value.lower() if value else False
            }
        
        return {
            "status": "healthy" if crew_available else "unavailable",
            "crew_importable": crew_available,
            "environment_variables": env_status,
            "crew_path": str(crew_path),
            "warnings": [
                "Using dummy API keys - replace with real keys for production use"
                if any(env["is_dummy"] for env in env_status.values())
                else None
            ]
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "crew_importable": False
        }


@router.post("/validate-document")
async def validate_document_only(
    request: CrewAnalysisRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Validate if a document contains financial information without running full analysis.
    
    Args:
        request: Document path and query
        current_user: Authenticated user
        
    Returns:
        Document validation results
    """
    try:
        # Check if document exists
        if not os.path.exists(request.document_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found at path: {request.document_path}"
            )
        
        # Import and use the validation tool directly
        if not FinancialDocumentTool:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Document validation service is not available"
            )
        
        # Run validation
        tool = FinancialDocumentTool()
        validation_result = tool._run(request.document_path)
        
        # Parse the JSON result
        try:
            result = json.loads(validation_result)
        except json.JSONDecodeError:
            result = {"error": "Failed to parse validation result", "raw_result": validation_result}
        
        return {
            "status": "success",
            "validation_result": result,
            "document_path": request.document_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "document_path": request.document_path
        }
