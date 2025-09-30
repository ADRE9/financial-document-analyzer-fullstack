# MongoDB Setup Guide

This guide explains how to set up MongoDB for the Financial Document Analyzer.

## Quick Start with MongoDB Atlas (Recommended for Production)

The easiest way to get started is using MongoDB Atlas (cloud):

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster (free tier available)

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Update your `.env` file:

```env
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/financial_docs?retryWrites=true&w=majority
```

## Local MongoDB Setup

### Using Docker (Recommended for Development)

1. **Start MongoDB with Docker**:

```bash
# Run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=financial_docs \
  mongo:7.0

# Check if running
docker ps
```

2. **Create Docker Compose** (Alternative):

Create `docker-compose.mongodb.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: financial_docs_mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: financial_docs
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d

volumes:
  mongodb_data:
```

Run with:
```bash
docker-compose -f docker-compose.mongodb.yml up -d
```

### Manual MongoDB Installation

#### macOS with Homebrew

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Connect to MongoDB
mongosh
```

#### Ubuntu/Debian

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows

1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer (.msi file)
3. Choose "Complete" installation
4. Install as a Windows Service
5. Start MongoDB service from Services management console

## Configuration

### Environment Variables

Copy the example environment file and update the MongoDB settings:

```bash
cp env.example .env
```

Edit `.env` with your MongoDB configuration:

```env
# MongoDB Database Settings
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USER=admin
MONGODB_PASSWORD=password
MONGODB_DB=financial_docs

# Or use full MongoDB URL (preferred)
MONGODB_URL=mongodb://admin:password@localhost:27017/financial_docs

# For MongoDB Atlas
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/financial_docs?retryWrites=true&w=majority
```

### Security Settings

For production, always:
- Enable authentication
- Use SSL/TLS connections
- Create specific database users (not root)
- Use strong passwords
- Enable IP whitelisting

## Testing Connections

### MongoDB Shell

Test your connection using MongoDB shell:

```bash
# Local connection
mongosh "mongodb://localhost:27017/financial_docs"

# With authentication
mongosh "mongodb://admin:password@localhost:27017/financial_docs"

# MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/financial_docs"
```

### Health Check Endpoints

Once the API is running, check MongoDB health via HTTP:

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

1. **Start MongoDB**:
   ```bash
   docker-compose -f docker-compose.mongodb.yml up -d
   ```

2. **Install Python dependencies**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run the API**:
   ```bash
   uvicorn app.main:app --reload
   ```

### Using Local MongoDB

1. **Start MongoDB** service (see installation methods above)
2. **Configure environment** (see Configuration above)
3. **Install dependencies and run API** (same as Docker method)

## Database Management

### MongoDB Compass (GUI Tool)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse collections, run queries, analyze performance

### Command Line Operations

```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/financial_docs"

# List databases
show dbs

# Use database
use financial_docs

# List collections
show collections

# Find documents
db.users.find()
db.financial_documents.find()

# Create index
db.financial_documents.createIndex({ "user_id": 1, "document_type": 1 })

# Get database stats
db.stats()
```

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure MongoDB is running: `docker ps` or `brew services list`
   - Check host and port settings
   - Verify firewall settings

2. **Authentication Failed**:
   - Check username and password
   - Ensure user has proper permissions
   - For Atlas: ensure IP is whitelisted

3. **Database Not Found**:
   - MongoDB creates databases automatically
   - Check database name in configuration

4. **Performance Issues**:
   - Check if indexes are created
   - Monitor with MongoDB Compass
   - Review query patterns

### Debug Mode

Enable debug mode for detailed logging:

```env
DEBUG=true
```

This will show MongoDB queries and connection details in the logs.

### Docker Issues

If using Docker and having connection issues:

1. **Check container status**:
   ```bash
   docker ps
   docker logs mongodb
   ```

2. **Restart container**:
   ```bash
   docker restart mongodb
   ```

3. **Remove and recreate**:
   ```bash
   docker stop mongodb
   docker rm mongodb
   # Run docker run command again
   ```

## MongoDB Features Used

### Beanie ODM

This application uses Beanie ODM (Object Document Mapper) which provides:

- **Pydantic Integration**: Models are Pydantic models
- **Async Support**: Built on Motor async driver
- **Type Safety**: Full TypeScript-like typing
- **Automatic Validation**: Pydantic validation on save
- **Index Management**: Automatic index creation

### Document Models

- **Users**: User authentication and profiles
- **UserSessions**: JWT token management
- **FinancialDocuments**: Document storage and analysis results

### Indexes

Automatically created indexes for optimal performance:

- User email and username (unique)
- Document user_id and type combinations
- Text search on document content
- TTL indexes for session expiration

## Next Steps

Once MongoDB is connected:

1. **Test API Endpoints**: Use `/health/databases` to verify connection
2. **Register Users**: Test authentication endpoints
3. **Upload Documents**: Test document management
4. **Monitor Performance**: Use MongoDB Compass or logs

## Security Notes

- **Change default passwords** in production
- **Use environment variables** for sensitive data
- **Enable SSL/TLS** for MongoDB connections in production
- **Use MongoDB Atlas** for managed security features
- **Regular backups** for production data
- **Monitor access logs** and set up alerts

## MongoDB Atlas Additional Features

For production, consider MongoDB Atlas features:

- **Automatic Backups**: Point-in-time recovery
- **Monitoring**: Performance and usage analytics
- **Security**: IP whitelisting, VPC peering
- **Scaling**: Horizontal and vertical scaling
- **Global Clusters**: Multi-region deployments
