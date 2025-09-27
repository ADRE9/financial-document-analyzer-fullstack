# Technical Context: Financial Document Analyzer

## Technology Stack

### Backend Technologies

- **Framework**: FastAPI 0.115.x
- **Language**: Python 3.x
- **Validation**: Pydantic 2.7.x
- **Server**: Uvicorn with ASGI
- **Configuration**: Pydantic Settings
- **Security**: Python-JOSE for JWT, Passlib for password hashing
- **File Handling**: Python-multipart for file uploads
- **Environment**: Python-dotenv for environment variables

### Frontend Technologies

- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.7
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS 4.1.13
- **Forms**: React Hook Form 7.63.0 with Zod validation
- **Routing**: React Router 7.9.3
- **State Management**: React hooks (no external state management yet)
- **Notifications**: Sonner 2.0.7
- **Icons**: Lucide React 0.544.0

### Development Tools

- **Package Manager**: pnpm (frontend), pip (backend)
- **Linting**: ESLint 9.36.0
- **Type Checking**: TypeScript
- **Code Formatting**: Prettier (via ESLint)
- **Version Control**: Git

## Development Environment

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Important**: During development, always run the backend in the foreground (never detached). The server should stop when you close the terminal or press Ctrl+C. In production, detached processes are acceptable.

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

### Environment Configuration

- Backend uses `.env` file for configuration
- Frontend uses Vite environment variables
- CORS configured for local development (ports 3000, 5173)

## Project Structure

### Backend Structure

```
backend/
├── app/                    # Main application code
│   ├── main.py            # FastAPI app and middleware
│   ├── config.py          # Settings and configuration
│   ├── dependencies.py    # Dependency injection
│   ├── models/            # Data models
│   │   └── schemas.py     # Pydantic schemas
│   └── routers/           # API route handlers
│       ├── health.py      # Health check endpoints
│       ├── documents.py   # Document management
│       └── analytics.py   # Analytics endpoints
├── requirements.txt       # Python dependencies
├── pyproject.toml        # Project configuration
├── Dockerfile            # Container configuration
├── docker-compose.yml    # Multi-container setup
└── env.example          # Environment variables template
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   └── ui/           # Reusable UI components
│   ├── pages/            # Page components
│   ├── services/         # API service layer
│   ├── store/            # State management
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## API Design

### Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /documents/` - List documents
- `POST /documents/upload` - Upload document
- `GET /documents/{id}` - Get document details
- `DELETE /documents/{id}` - Delete document
- `GET /analytics/` - Analytics data

### Data Models

- **DocumentType**: Enum (invoice, receipt, statement, contract, other)
- **DocumentUploadRequest**: Upload request with metadata
- **DocumentAnalysisResponse**: Analysis results with confidence score
- **ErrorResponse**: Standardized error format
- **SuccessResponse**: Standardized success format

## Configuration

### Backend Configuration

- App name and version
- Debug mode toggle
- Server host and port
- CORS allowed origins
- Security settings (JWT, secret keys)
- Database URL (for future use)

### Frontend Configuration

- Vite development server
- TypeScript strict mode
- Tailwind CSS with custom configuration
- ESLint rules for code quality

## Dependencies

### Backend Dependencies

- FastAPI with standard extras
- Pydantic for data validation
- Uvicorn for ASGI server
- Python-multipart for file uploads
- Security libraries (JOSE, Passlib)
- Environment management

### Frontend Dependencies

- React with TypeScript
- Radix UI for accessible components
- Tailwind CSS for styling
- React Hook Form for form management
- Zod for validation
- Lucide React for icons
- Sonner for notifications

## Future Technical Considerations

### Database Integration

- SQLAlchemy for ORM
- Alembic for migrations
- PostgreSQL or SQLite for data storage

### Document Processing

- OCR libraries (Tesseract, PaddleOCR)
- PDF processing (PyPDF2, pdfplumber)
- Image processing (PIL, OpenCV)
- Machine learning models for data extraction

### Deployment

- Docker containerization
- Cloud deployment (AWS, GCP, Azure)
- CI/CD pipeline setup
- Environment-specific configurations
