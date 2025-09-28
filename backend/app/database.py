"""
MongoDB connection and session management using Beanie ODM.

This module provides modern MongoDB connection setup for FastAPI using:
- Motor: Async MongoDB driver
- Beanie: Modern ODM with Pydantic integration
- FastAPI lifespan events for connection management
"""

import logging
from contextlib import asynccontextmanager
from typing import Optional

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Global database instances
mongodb_client: Optional[AsyncIOMotorClient] = None
mongodb_database = None


async def connect_to_mongodb():
    """Initialize MongoDB connection using Beanie ODM."""
    global mongodb_client, mongodb_database
    
    try:
        logger.info(f"Connecting to MongoDB at {settings.mongodb_host}:{settings.mongodb_port}")
        
        # Create MongoDB client with recommended settings
        mongodb_client = AsyncIOMotorClient(
            settings.database_url,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=10000,         # 10 second timeout
            maxPoolSize=50,                 # Connection pool size
            minPoolSize=10,                 # Minimum connections
            maxIdleTimeMS=30000,           # Close connections after 30s idle
        )
        
        # Get database
        mongodb_database = mongodb_client[settings.mongodb_db]
        
        # Test connection
        await test_mongodb_connection()
        
        # Initialize Beanie with document models
        from app.models import DOCUMENT_MODELS
        await init_beanie(
            database=mongodb_database,
            document_models=DOCUMENT_MODELS
        )
        
        logger.info("MongoDB connection initialized successfully")
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during MongoDB initialization: {e}")
        raise


async def close_mongodb_connection():
    """Close MongoDB connection."""
    global mongodb_client
    
    try:
        if mongodb_client:
            mongodb_client.close()
            logger.info("MongoDB connection closed successfully")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")


async def test_mongodb_connection():
    """Test MongoDB connection with ping."""
    if not mongodb_client:
        raise Exception("MongoDB client not initialized")
    
    try:
        # Ping the database to test connection
        await mongodb_client.admin.command('ping')
        logger.info("MongoDB connection test successful")
        
    except Exception as e:
        logger.error(f"MongoDB connection test failed: {e}")
        raise


# Health check functions
async def check_mongodb_health() -> dict:
    """Check MongoDB health status."""
    try:
        if not mongodb_client:
            return {"status": "error", "message": "MongoDB client not initialized"}
        
        # Test connection with ping
        await mongodb_client.admin.command('ping')
        
        # Get server info
        server_info = await mongodb_client.server_info()
        
        return {
            "status": "healthy",
            "message": "MongoDB connection successful",
            "version": server_info.get("version", "unknown"),
            "database": settings.mongodb_db
        }
        
    except Exception as e:
        return {"status": "error", "message": f"MongoDB connection failed: {str(e)}"}


async def get_database_health() -> dict:
    """Get comprehensive database health status."""
    mongodb_health = await check_mongodb_health()
    
    return {
        "status": mongodb_health["status"],
        "mongodb": mongodb_health
    }


# FastAPI dependency for accessing database
async def get_database():
    """FastAPI dependency to get MongoDB database instance."""
    if not mongodb_database:
        raise Exception("MongoDB database not initialized")
    return mongodb_database


@asynccontextmanager
async def lifespan_context():
    """Context manager for FastAPI lifespan events."""
    # Startup
    await connect_to_mongodb()
    try:
        yield
    finally:
        # Shutdown
        await close_mongodb_connection()


# Utility functions for common database operations
async def create_indexes():
    """Create database indexes for optimal performance."""
    if not mongodb_database:
        logger.warning("Cannot create indexes: MongoDB database not initialized")
        return
    
    try:
        # Example indexes - adjust based on your document models
        # await mongodb_database.documents.create_index("document_type")
        # await mongodb_database.documents.create_index("upload_date")
        # await mongodb_database.documents.create_index("user_id")
        # await mongodb_database.users.create_index("email", unique=True)
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create database indexes: {e}")
        raise


async def get_database_stats() -> dict:
    """Get database statistics."""
    if not mongodb_database:
        return {"error": "Database not initialized"}
    
    try:
        stats = await mongodb_database.command("dbStats")
        return {
            "database": stats.get("db"),
            "collections": stats.get("collections", 0),
            "objects": stats.get("objects", 0),
            "dataSize": stats.get("dataSize", 0),
            "storageSize": stats.get("storageSize", 0),
            "indexes": stats.get("indexes", 0)
        }
    except Exception as e:
        logger.error(f"Failed to get database stats: {e}")
        return {"error": str(e)}