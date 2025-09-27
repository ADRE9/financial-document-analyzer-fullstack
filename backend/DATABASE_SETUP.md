# Database Setup Guide

This guide explains how to set up PostgreSQL and Redis databases for the Financial Document Analyzer.

## Quick Start with Docker

The easiest way to get started is using Docker Compose:

```bash
# Start all services (API, PostgreSQL, Redis)
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api
```

## Manual Setup

### PostgreSQL Setup

1. **Install PostgreSQL** (if not using Docker):

   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create Database**:

   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE financial_docs;

   # Create user (optional)
   CREATE USER financial_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE financial_docs TO financial_user;
   ```

### Redis Setup

1. **Install Redis** (if not using Docker):

   ```bash
   # macOS with Homebrew
   brew install redis
   brew services start redis

   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   ```

## Configuration

### Environment Variables

Copy the example environment file and update the database settings:

```bash
cp env.example .env
```

Edit `.env` with your database configuration:

```env
# PostgreSQL Database Settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=financial_docs

# Redis Settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Alternative: Full URLs

You can also use full database URLs instead of individual components:

```env
# PostgreSQL
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/financial_docs

# Redis
REDIS_URL=redis://localhost:6379/0
```

## Testing Connections

### Test Script

Run the included test script to verify your database connections:

```bash
# Install dependencies first
pip install -r requirements.txt

# Run the test script
python test_db_connections.py
```

### Health Check Endpoints

Once the API is running, you can check database health via HTTP:

```bash
# Basic health check
curl http://localhost:8000/health/

# Readiness check (includes database status)
curl http://localhost:8000/health/ready

# Database-specific health check
curl http://localhost:8000/health/databases
```

## Development Workflow

### Using Docker (Recommended)

1. **Start services**:

   ```bash
   docker-compose up -d
   ```

2. **Install Python dependencies** (for local development):

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the API**:
   ```bash
   uvicorn app.main:app --reload
   ```

### Using Local Databases

1. **Start PostgreSQL and Redis** locally
2. **Create the database** (see PostgreSQL setup above)
3. **Configure environment** (see Configuration above)
4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Run the API**:
   ```bash
   uvicorn app.main:app --reload
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused**:

   - Ensure PostgreSQL/Redis are running
   - Check host and port settings
   - Verify firewall settings

2. **Authentication Failed**:

   - Check username and password
   - Ensure user has proper permissions

3. **Database Not Found**:
   - Create the database manually
   - Check database name in configuration

### Debug Mode

Enable debug mode for detailed logging:

```env
DEBUG=true
```

This will show SQL queries and connection details in the logs.

### Docker Issues

If using Docker and having connection issues:

1. **Check service status**:

   ```bash
   docker-compose ps
   ```

2. **View logs**:

   ```bash
   docker-compose logs postgres
   docker-compose logs redis
   docker-compose logs api
   ```

3. **Restart services**:
   ```bash
   docker-compose restart
   ```

## Next Steps

Once the databases are connected:

1. **Create database models** (SQLAlchemy models)
2. **Set up migrations** (Alembic)
3. **Replace mock data** with real database operations
4. **Add database tests**

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Consider using connection pooling for production
- Enable SSL/TLS for database connections in production
