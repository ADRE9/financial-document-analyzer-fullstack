"""
Database connection and session management.

This module provides database connection setup for PostgreSQL and Redis,
including connection pooling and session management.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models import Base

# Configure logging
logger = logging.getLogger(__name__)

# Global database instances
postgres_engine = None
postgres_async_engine = None


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


async def init_databases():
    """Initialize database connections and create tables."""
    logger.info("Initializing database connections...")
    
    try:
        # Initialize PostgreSQL
        init_postgres_engine()
        await test_postgres_connection()
        logger.info("PostgreSQL connection initialized successfully")
        
        # Create tables
        await create_tables()
        logger.info("Database tables created successfully")
        
        logger.info("Database connections initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize databases: {e}")
        raise


async def create_tables():
    """Create database tables."""
    if not postgres_async_engine:
        raise Exception("PostgreSQL async engine not initialized")
    
    try:
        async with postgres_async_engine.begin() as conn:
            # Create all tables defined in models
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
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


async def close_databases():
    """Close database connections."""
    logger.info("Closing database connections...")
    
    try:
        if postgres_async_engine:
            await postgres_async_engine.dispose()
            logger.info("PostgreSQL async engine closed")
        
        if postgres_engine:
            postgres_engine.dispose()
            logger.info("PostgreSQL engine closed")
        
        logger.info("Database connections closed successfully")
        
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


# FastAPI dependency for database session
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency to get PostgreSQL async session."""
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


async def get_database_health() -> dict:
    """Get database health status."""
    postgres_health = await check_postgres_health()
    
    return {
        "status": postgres_health["status"],
        "postgres": postgres_health
    }
