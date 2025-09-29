# Financial Document Analyzer - Documentation Hub

Welcome to the comprehensive documentation for the Financial Document Analyzer project. This documentation is organized into logical sections for easy navigation and reference.

## 📁 Documentation Structure

### 🏗️ [Backend Documentation](./backend/)

Core backend API and service documentation.

- **[README.md](./backend/README.md)** - Backend overview and setup
- **[SCRIPTS.md](./backend/SCRIPTS.md)** - Development and deployment scripts
- **[RBAC_IMPLEMENTATION.md](./backend/RBAC_IMPLEMENTATION.md)** - Role-based access control implementation
- **[MIGRATION_SUMMARY.md](./backend/MIGRATION_SUMMARY.md)** - Database migration history and changes
- **[MONGODB_SETUP.md](./backend/MONGODB_SETUP.md)** - MongoDB configuration and setup guide

### 🎨 [Frontend Documentation](./frontend/)

React frontend application documentation.

- **[README.md](./frontend/README.md)** - Frontend overview and development setup
- **[FRONTEND_RBAC_IMPLEMENTATION.md](./frontend/FRONTEND_RBAC_IMPLEMENTATION.md)** - Frontend RBAC implementation details
- **[AUTHENTICATION.md](./frontend/AUTHENTICATION.md)** - Authentication flow and implementation

### 🤖 [CrewAI Documentation](./crew-ai/)

AI-powered document analysis using CrewAI framework.

- **[README.md](./crew-ai/README.md)** - CrewAI integration overview
- **[AGENT_DESIGN.md](./crew-ai/AGENT_DESIGN.md)** - AI agent architecture and design
- **[AGENT_TRANSFORMATION.md](./crew-ai/AGENT_TRANSFORMATION.md)** - Agent transformation and evolution
- **[QUICK_START.md](./crew-ai/QUICK_START.md)** - Quick start guide for CrewAI setup

### 📋 [Project Documentation](./project/)

Project-level documentation and reports.

- **[VENV_CLEANUP_REPORT.md](./project/VENV_CLEANUP_REPORT.md)** - Virtual environment cleanup report

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or MongoDB)
- Redis

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

### Database Setup

```bash
# Using Docker
docker-compose up -d postgres redis

# Or follow the detailed setup in backend/MONGODB_SETUP.md
```

## 🏗️ Architecture Overview

This is a full-stack financial document analysis system with the following components:

- **Backend**: FastAPI with PostgreSQL/MongoDB and Redis
- **Frontend**: React 19 with TypeScript and Tailwind CSS
- **AI Engine**: CrewAI for intelligent document analysis
- **Authentication**: JWT-based with role-based access control
- **Document Processing**: OCR and AI-powered data extraction

## 📊 Current Status

- **Phase**: FULL-TIME CHALLENGE ACTIVATED
- **Completion**: ~15% (infrastructure complete)
- **Focus**: Database integration and AI document processing
- **Branch**: `feat/crew_ai-integrtions`

## 🔧 Development

### Key Technologies

- **Backend**: FastAPI, SQLAlchemy, Pydantic, JWT
- **Frontend**: React 19, TypeScript, Vite, Radix UI, Tailwind CSS
- **AI**: CrewAI 0.130.0, OpenAI GPT models
- **Database**: PostgreSQL, Redis
- **Authentication**: JWT with RBAC (Admin/Viewer roles)

### Development Workflow

1. Check the [Backend Documentation](./backend/) for API setup
2. Review [Frontend Documentation](./frontend/) for UI development
3. Consult [CrewAI Documentation](./crew-ai/) for AI integration
4. Follow the project documentation for deployment

## 🐛 Bug Tracking

This project maintains a comprehensive bug tracking system. All identified issues are documented and tracked systematically. See the memory bank for current bug status and resolution progress.

## 📝 Contributing

When contributing to this project:

1. Read the relevant documentation section
2. Follow the established patterns and conventions
3. Update documentation when making changes
4. Test thoroughly before submitting changes

## 🔗 External Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React 19 Documentation](https://react.dev/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

_This documentation is maintained as part of the Financial Document Analyzer project. For the most up-to-date information, always refer to the latest version in the repository._
