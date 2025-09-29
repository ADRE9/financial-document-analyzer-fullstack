# Financial Document Analyzer API

A FastAPI-based backend service for analyzing financial documents with modern Python best practices.

## Features

- 🚀 **FastAPI** - Modern, fast web framework for building APIs
- 📊 **Document Analysis** - Upload and analyze financial documents
- 📈 **Analytics** - Comprehensive analytics and reporting
- 🔒 **Security** - JWT authentication and security middleware
- 🐳 **Docker** - Containerized deployment
- 📝 **Auto Documentation** - Interactive API docs with Swagger UI
- 🏥 **Health Checks** - Built-in health monitoring endpoints

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── dependencies.py      # Shared dependencies
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic models
│   └── routers/
│       ├── __init__.py
│       ├── health.py        # Health check endpoints
│       ├── documents.py     # Document management endpoints
│       └── analytics.py     # Analytics endpoints
├── main.py                 # FastAPI CLI entry point
├── pyproject.toml          # Project configuration and FastAPI CLI settings
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── env.example            # Environment variables template
├── .gitignore             # Git ignore file
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Python 3.11+
- pip or poetry
- Docker (optional)

### Local Development

1. **Clone and navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create a virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server:**

   **Option 1: Using FastAPI CLI (Recommended):**

   ```bash
   fastapi dev main.py
   ```

   **Option 2: Using uvicorn directly:**

   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access the API:**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Docker Development

1. **Build and run with Docker Compose:**

   ```bash
   docker-compose up --build
   ```

2. **Access the API:**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs

## API Endpoints

### Health Check

- `GET /health/` - Basic health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Documents

- `GET /documents/` - List all documents
- `POST /documents/upload` - Upload a document
- `GET /documents/{document_id}` - Get document analysis
- `DELETE /documents/{document_id}` - Delete a document

### Analytics

- `GET /analytics/overview` - Get analytics overview
- `GET /analytics/trends` - Get processing trends
- `GET /analytics/performance` - Get performance metrics
- `GET /analytics/document-types` - Get document type analytics

## FastAPI CLI Configuration

The project is configured to work with FastAPI CLI. The configuration is defined in `pyproject.toml`:

```toml
[tool.fastapi]
app = "main:app"
host = "0.0.0.0"
port = 8000
reload = true
reload-dir = ["app"]
log-level = "info"
```

This allows you to run the development server with:

```bash
fastapi dev main.py
```

## Configuration

The application uses environment variables for configuration. Copy `env.example` to `.env` and modify as needed:

```bash
# Application Settings
APP_NAME="Financial Document Analyzer API"
DEBUG=true

# Server Settings
HOST=0.0.0.0
PORT=8000

# Security Settings
SECRET_KEY=your-secret-key-change-in-production

# CORS Settings
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

## Development

### Code Structure

- **`app/main.py`** - FastAPI application setup, middleware, and exception handlers
- **`app/config.py`** - Configuration management using Pydantic Settings
- **`app/models/schemas.py`** - Pydantic models for request/response validation
- **`app/routers/`** - API route handlers organized by feature
- **`app/dependencies.py`** - Shared dependencies and utilities

### Adding New Features

1. **Create new models** in `app/models/schemas.py`
2. **Add new routes** in `app/routers/`
3. **Update dependencies** in `app/dependencies.py` if needed
4. **Include new routers** in `app/main.py`

### Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

## Production Deployment

### Docker

```bash
# Build production image
docker build -t financial-doc-analyzer .

# Run production container
docker run -p 8000:8000 financial-doc-analyzer
```

### Environment Variables for Production

```bash
DEBUG=false
SECRET_KEY=your-production-secret-key
ALLOWED_ORIGINS=["https://yourdomain.com"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
