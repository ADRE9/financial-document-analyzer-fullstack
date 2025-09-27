#!/usr/bin/env python3
"""
Database Connection Test Script

This script tests the PostgreSQL database connection and checks if tables are created.
Run this script to verify your database setup.
"""

import asyncio
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.exc import SQLAlchemyError

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.config import settings
from app.database import init_postgres_engine, test_postgres_connection, create_tables
from app.models import Base


async def test_connection():
    """Test database connection and table creation."""
    print("🔍 Testing PostgreSQL Database Connection...")
    print("=" * 50)
    
    # Display connection details
    print(f"Host: {settings.postgres_host}")
    print(f"Port: {settings.postgres_port}")
    print(f"Database: {settings.postgres_db}")
    print(f"User: {settings.postgres_user}")
    print(f"Debug Mode: {settings.debug}")
    print()
    
    try:
        # Test 1: Initialize engine
        print("1️⃣ Initializing PostgreSQL engine...")
        init_postgres_engine()
        print("✅ Engine initialized successfully")
        
        # Test 2: Test connection
        print("\n2️⃣ Testing database connection...")
        await test_postgres_connection()
        print("✅ Connection test successful")
        
        # Test 3: Check if tables exist
        print("\n3️⃣ Checking existing tables...")
        from app.database import postgres_async_engine
        
        async with postgres_async_engine.begin() as conn:
            # Query to get all tables in the current database
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            
            if tables:
                print(f"📋 Found {len(tables)} tables:")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("⚠️  No tables found in the database")
        
        # Test 4: Create tables if they don't exist
        print("\n4️⃣ Creating/updating database tables...")
        await create_tables()
        print("✅ Tables created/updated successfully")
        
        # Test 5: Verify tables were created
        print("\n5️⃣ Verifying table creation...")
        async with postgres_async_engine.begin() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            
            if tables:
                print(f"📋 Database now has {len(tables)} tables:")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("❌ No tables found after creation attempt")
        
        print("\n🎉 Database connection test completed successfully!")
        return True
        
    except SQLAlchemyError as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


async def test_health_endpoint():
    """Test the health endpoint to verify database status."""
    print("\n🏥 Testing Health Endpoint...")
    print("=" * 30)
    
    try:
        import httpx
        
        async with httpx.AsyncClient() as client:
            # Test basic health
            response = await client.get("http://localhost:8000/health/")
            if response.status_code == 200:
                print("✅ Basic health endpoint working")
                print(f"   Response: {response.json()}")
            else:
                print(f"❌ Health endpoint failed: {response.status_code}")
                return False
            
            # Test database health
            response = await client.get("http://localhost:8000/health/databases")
            if response.status_code == 200:
                print("✅ Database health endpoint working")
                print(f"   Response: {response.json()}")
            else:
                print(f"❌ Database health endpoint failed: {response.status_code}")
                return False
                
        return True
        
    except Exception as e:
        print(f"❌ Health endpoint test failed: {e}")
        print("   Make sure the API server is running: uvicorn app.main:app --reload")
        return False


def print_troubleshooting_tips():
    """Print troubleshooting tips for common issues."""
    print("\n🔧 Troubleshooting Tips")
    print("=" * 30)
    print("If you're having connection issues:")
    print()
    print("1. Check if PostgreSQL is running:")
    print("   - DBngin: Make sure PostgreSQL service is started")
    print("   - TablePlus: Try connecting manually first")
    print()
    print("2. Verify connection details:")
    print(f"   - Host: {settings.postgres_host}")
    print(f"   - Port: {settings.postgres_port}")
    print(f"   - Database: {settings.postgres_db}")
    print(f"   - User: {settings.postgres_user}")
    print()
    print("3. Check if database exists:")
    print("   - Connect to PostgreSQL and run: CREATE DATABASE financial_docs;")
    print()
    print("4. Check firewall/network settings:")
    print("   - Ensure port 5432 is not blocked")
    print()
    print("5. Try different connection methods:")
    print("   - Update .env file with correct credentials")
    print("   - Use full database URL: POSTGRES_URL=postgresql://user:pass@host:port/db")


async def main():
    """Main test function."""
    print("🚀 Financial Document Analyzer - Database Connection Test")
    print("=" * 60)
    
    # Test database connection
    db_success = await test_connection()
    
    # Test health endpoint (if API is running)
    health_success = await test_health_endpoint()
    
    print("\n📊 Test Results Summary")
    print("=" * 30)
    print(f"Database Connection: {'✅ Success' if db_success else '❌ Failed'}")
    print(f"Health Endpoints: {'✅ Success' if health_success else '❌ Failed'}")
    
    if not db_success:
        print_troubleshooting_tips()
    
    return db_success and health_success


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
