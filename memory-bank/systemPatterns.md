# System Patterns: Financial Document Analyzer

## Architecture Overview

The system follows a modern full-stack architecture with clear separation of concerns:

```
Frontend (React/TypeScript) ←→ Backend (FastAPI/Python) ←→ Database (TBD)
```

## Backend Architecture

### FastAPI Application Structure

```
app/
├── main.py              # Application entry point and middleware
├── config.py            # Settings and configuration
├── dependencies.py      # Dependency injection
├── models/
│   └── schemas.py       # Pydantic models for data validation
└── routers/
    ├── health.py        # Health check endpoints
    ├── documents.py     # Document management endpoints
    └── analytics.py     # Analytics and reporting endpoints
```

### Key Patterns

#### 1. Router Pattern

- Each domain (health, documents, analytics) has its own router
- Routers are included in main app with prefixes
- Clear separation of concerns

#### 2. Pydantic Models

- Request/response validation using Pydantic
- Type safety and automatic serialization
- Clear data contracts between frontend and backend

#### 3. Middleware Stack

- CORS middleware for cross-origin requests
- Request logging middleware for monitoring
- Exception handling middleware for error management
- Trusted host middleware for security

#### 4. Error Handling

- Centralized exception handlers
- Consistent error response format
- Proper HTTP status codes
- Detailed logging for debugging

## Frontend Architecture

### React Application Structure

```
src/
├── components/
│   └── ui/              # Reusable UI components (Radix UI)
├── pages/               # Page components
├── services/            # API service layer
├── store/               # State management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── hooks/               # Custom React hooks
```

### Key Patterns

#### 1. Component-Based Architecture

- Reusable UI components using Radix UI
- Clear component hierarchy
- Props-based data flow

#### 2. TypeScript Integration

- Strong typing throughout the application
- Interface definitions for API responses
- Type safety for component props

#### 3. Modern Build Tools

- Vite for fast development and building
- ESLint for code quality
- Tailwind CSS for styling

## Data Flow Patterns

### Request Flow

1. Frontend makes API request
2. Middleware processes request (logging, CORS)
3. Router handles endpoint
4. Business logic processes request
5. Response serialized using Pydantic
6. Middleware adds headers and logs response

### Error Flow

1. Exception occurs in business logic
2. Exception handler catches and logs error
3. Standardized error response created
4. Error returned to frontend
5. Frontend displays user-friendly error message

## Security Patterns

### Input Validation

- File type validation (allowed extensions)
- File size limits (10MB max)
- Request data validation using Pydantic

### CORS Configuration

- Specific allowed origins
- Credential support
- Method and header restrictions

### Error Information

- No sensitive data in error responses
- Detailed logging for debugging
- User-friendly error messages

## Development Environment Patterns

### Virtual Environment Management

**Critical Rule:** Single virtual environment per project component

- **Backend Python:** `backend/venv/` - Single Python virtual environment

  - Python 3.13.1
  - All dependencies from `requirements.txt`
  - 50+ packages including FastAPI, Motor, Beanie, Pydantic
  - ~120MB size

- **Frontend Node:** `frontend/node_modules/` - Node.js dependencies

  - Managed by pnpm
  - Separate from Python dependencies

- **CrewAI Integration:** `backend/financial_document_analyzer_crew/`
  - Separate subproject with own `pyproject.toml`
  - Not yet integrated into main backend
  - Will share parent `backend/venv` when integrated

### Environment Workflow

```bash
# Backend development
cd backend
source venv/bin/activate
python -m app.main

# Frontend development
cd frontend
pnpm install
pnpm dev
```

### Prevention Measures

- `.gitignore` includes: `venv/`, `.venv/`, `env/`, `.env/`
- Single source of truth for dependencies
- No duplicate virtual environments
- Clear documentation in VENV_CLEANUP_REPORT.md

## Future Patterns (To Be Implemented)

### Database Integration

- Repository pattern for data access
- Database models using SQLAlchemy
- Migration management

### Document Processing

- Async processing for large documents
- Queue system for batch processing
- Progress tracking for long-running tasks

### Authentication

- JWT token-based authentication
- Role-based access control
- Session management
