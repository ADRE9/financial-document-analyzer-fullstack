from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import time
from datetime import datetime

from app.config import settings
from app.routers import health, documents, analytics, auth, protected, auth_test
from app.models.schemas import ErrorResponse
from app.database import init_databases, close_databases

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A FastAPI backend for financial document analysis",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests and their processing time."""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log response
    logger.info(
        f"Response: {response.status_code} - "
        f"Process time: {process_time:.4f}s"
    )
    
    # Add processing time header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response


# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=f"HTTP {exc.status_code}",
            detail=exc.detail,
            timestamp=datetime.utcnow()
        ).model_dump(mode='json')
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.error(f"Validation Error: {exc.errors()}")
    
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error="Validation Error",
            detail="Invalid request data",
            timestamp=datetime.utcnow()
        ).model_dump(mode='json')
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            detail="An unexpected error occurred",
            timestamp=datetime.utcnow()
        ).model_dump(mode='json')
    )


# Include routers
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(protected.router)
app.include_router(auth_test.router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Financial Document Analyzer API",
        "version": settings.app_version,
        "docs_url": "/docs" if settings.debug else "Documentation disabled in production",
        "health_check": "/health",
        "timestamp": datetime.utcnow().isoformat()
    }


# Startup event
@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"Server will run on {settings.host}:{settings.port}")
    
    # Initialize database connections
    try:
        await init_databases()
        logger.info("Database connections initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database connections: {e}")
        # Don't raise here to allow the app to start even if DB is unavailable
        # This is useful for development and testing


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info("Shutting down Financial Document Analyzer API")
    
    # Close database connections
    try:
        await close_databases()
        logger.info("Database connections closed successfully")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
