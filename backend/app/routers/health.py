from fastapi import APIRouter, Depends
from datetime import datetime
from app.models.schemas import HealthResponse, HealthStatus
from app.config import settings
from app.dependencies import get_logger

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/", response_model=HealthResponse)
async def health_check(logger=Depends(get_logger)):
    """
    Health check endpoint to verify the API is running.
    """
    logger.info("Health check requested")
    
    return HealthResponse(
        status=HealthStatus.HEALTHY,
        message="API is running successfully",
        timestamp=datetime.utcnow(),
        version=settings.app_version
    )


@router.get("/ready")
async def readiness_check(logger=Depends(get_logger)):
    """
    Readiness check endpoint to verify the API is ready to serve requests.
    """
    logger.info("Readiness check requested")
    
    # TODO: Add checks for database connectivity, external services, etc.
    
    return {
        "status": "ready",
        "message": "API is ready to serve requests",
        "timestamp": datetime.utcnow()
    }


@router.get("/live")
async def liveness_check(logger=Depends(get_logger)):
    """
    Liveness check endpoint to verify the API process is alive.
    """
    logger.info("Liveness check requested")
    
    return {
        "status": "alive",
        "message": "API process is alive",
        "timestamp": datetime.utcnow()
    }
