"""
Database connection and session management.

This module provides database connection setup for PostgreSQL and Redis,
including connection pooling and session management.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

import redis.asyncio as redis
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Global database instances
postgres_engine = None
postgres_async_engine = None
redis_client = None


def init_postgres_engine():
    """Initialize PostgreSQL engine and session factory."""
    global postgres_engine, postgres_async_engine
    
    try:
        # Create synchronous engine for migrations and direct queries
        postgres_engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=settings.debug,
        )
        
        # Create async engine for FastAPI async operations
        async_database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
        postgres_async_engine = create_async_engine(
            async_database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=settings.debug,
        )
        
        logger.info("PostgreSQL engines initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize PostgreSQL engines: {e}")
        raise


def init_redis_client():
    """Initialize Redis client."""
    global redis_client
    
    try:
        redis_client = redis.from_url(
            settings.redis_connection_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
        )
        logger.info("Redis client initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize Redis client: {e}")
        raise


async def init_databases():
    """Initialize all database connections."""
    logger.info("Initializing database connections...")
    
    try:
        init_postgres_engine()
        init_redis_client()
        
        # Test connections
        await test_postgres_connection()
        await test_redis_connection()
        
        logger.info("All database connections initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize databases: {e}")
        raise


async def test_postgres_connection():
    """Test PostgreSQL connection."""
    if not postgres_async_engine:
        raise Exception("PostgreSQL async engine not initialized")
    
    try:
        async with postgres_async_engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            result.fetchone()
        logger.info("PostgreSQL connection test successful")
        
    except Exception as e:
        logger.error(f"PostgreSQL connection test failed: {e}")
        raise


async def test_redis_connection():
    """Test Redis connection."""
    if not redis_client:
        raise Exception("Redis client not initialized")
    
    try:
        await redis_client.ping()
        logger.info("Redis connection test successful")
        
    except Exception as e:
        logger.error(f"Redis connection test failed: {e}")
        raise


async def close_databases():
    """Close all database connections."""
    logger.info("Closing database connections...")
    
    try:
        if postgres_async_engine:
            await postgres_async_engine.dispose()
            logger.info("PostgreSQL async engine closed")
        
        if postgres_engine:
            postgres_engine.dispose()
            logger.info("PostgreSQL engine closed")
        
        if redis_client:
            await redis_client.close()
            logger.info("Redis client closed")
        
        logger.info("All database connections closed successfully")
        
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")


@asynccontextmanager
async def get_postgres_session() -> AsyncGenerator[AsyncSession, None]:
    """Get PostgreSQL async session."""
    if not postgres_async_engine:
        raise Exception("PostgreSQL async engine not initialized")
    
    async_session = sessionmaker(
        postgres_async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_redis_client() -> redis.Redis:
    """Get Redis client instance."""
    if not redis_client:
        raise Exception("Redis client not initialized")
    return redis_client


# Health check functions
async def check_postgres_health() -> dict:
    """Check PostgreSQL health status."""
    try:
        if not postgres_async_engine:
            return {"status": "error", "message": "PostgreSQL engine not initialized"}
        
        async with postgres_async_engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            result.fetchone()
        
        return {"status": "healthy", "message": "PostgreSQL connection successful"}
        
    except Exception as e:
        return {"status": "error", "message": f"PostgreSQL connection failed: {str(e)}"}


async def check_redis_health() -> dict:
    """Check Redis health status."""
    try:
        if not redis_client:
            return {"status": "error", "message": "Redis client not initialized"}
        
        await redis_client.ping()
        return {"status": "healthy", "message": "Redis connection successful"}
        
    except Exception as e:
        return {"status": "error", "message": f"Redis connection failed: {str(e)}"}


async def get_database_health() -> dict:
    """Get overall database health status."""
    postgres_health = await check_postgres_health()
    redis_health = await check_redis_health()
    
    overall_status = "healthy" if (
        postgres_health["status"] == "healthy" and 
        redis_health["status"] == "healthy"
    ) else "unhealthy"
    
    return {
        "status": overall_status,
        "postgres": postgres_health,
        "redis": redis_health
    }
