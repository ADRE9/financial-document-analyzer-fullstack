from fastapi import APIRouter, Depends
from datetime import datetime
from app.models.schemas import HealthResponse, HealthStatus
from app.config import settings
from app.dependencies import get_logger
from app.database import get_database_health

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
    
    # Check database connectivity
    db_health = await get_database_health()
    
    if db_health["status"] == "healthy":
        return {
            "status": "ready",
            "message": "API is ready to serve requests",
            "timestamp": datetime.utcnow().isoformat(),
            "databases": db_health
        }
    else:
        return {
            "status": "not_ready",
            "message": "API is not ready - database issues detected",
            "timestamp": datetime.utcnow().isoformat(),
            "databases": db_health
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
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/databases")
async def database_health_check(logger=Depends(get_logger)):
    """
    Database health check endpoint to verify database connectivity.
    """
    logger.info("Database health check requested")
    
    db_health = await get_database_health()
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        **db_health
    }
