from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging
import time
from datetime import datetime, timezone

from app.config import settings
from app.routers import health, documents, analytics, auth, protected, auth_test, auth_oauth2
from app.models.schemas import ErrorResponse
from app.database import connect_to_mongodb, close_mongodb_connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan event handler."""
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"Server will run on {settings.host}:{settings.port}")
    
    # Initialize MongoDB connection
    try:
        await connect_to_mongodb()
        logger.info("MongoDB connection initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB connection: {e}")
        # Don't raise here to allow the app to start even if DB is unavailable
        # This is useful for development and testing
    
    yield
    
    # Shutdown
    logger.info("Shutting down Financial Document Analyzer API")
    
    # Close MongoDB connection
    try:
        await close_mongodb_connection()
        logger.info("MongoDB connection closed successfully")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A FastAPI backend for financial document analysis",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
    lifespan=lifespan,
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
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=f"HTTP {exc.status_code}",
            detail=exc.detail,
            timestamp=datetime.now(timezone.utc)
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
            timestamp=datetime.now(timezone.utc)
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
            timestamp=datetime.now(timezone.utc)
        ).model_dump(mode='json')
    )


# Include routers
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(auth_oauth2.router)  # OAuth2 pattern following FastAPI docs
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
        "timestamp": datetime.now(timezone.utc).isoformat()
    }




if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
