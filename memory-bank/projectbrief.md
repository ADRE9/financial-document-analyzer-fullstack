# Project Brief: Financial Document Analyzer - Full Stack AI Developer Challenge

## Project Overview

A comprehensive financial document analysis system that processes corporate reports, financial statements, and investment documents using AI-powered analysis agents. This is a production-grade system that requires enterprise-level thinking and implementation.

## CRITICAL WARNING

**Every single line of code in this repository contains bugs, inefficiencies, or poor practices.** This is not an exaggeration - scrutinize each line of code.

## Core Requirements

### Functional Requirements

1. **Document Upload & Management**

   - Support multiple document types: invoices, receipts, statements, contracts
   - File format support: PDF, PNG, JPG, JPEG, TIFF
   - File size limit: 10MB per document (challenge: handle up to 100MB)
   - Document metadata tracking (type, description, upload date)
   - Batch upload capability
   - Document search and filtering

2. **AI-Powered Document Analysis**

   - AI-powered text extraction from documents using CrewAI 0.130.0
   - Structured data extraction (amounts, dates, vendors, line items)
   - Investment recommendations with risk assessment
   - Market insights and trend analysis
   - Confidence scoring for analysis results
   - Support for various financial document layouts
   - Handle corrupted or password-protected PDFs
   - Process non-English financial documents
   - Handle scanned documents with poor OCR quality

3. **User Interface**

   - Modern, responsive web application (React/Vue/Angular)
   - **Preferred**: TailwindCSS styling with shadcn/ui component library
   - Document upload with drag-and-drop and progress indicators
   - Interactive dashboards for financial analysis results
   - Document management interface (upload, view, delete, search)
   - Analysis history with filtering and sorting
   - Export functionality with download capabilities
   - Real-time status updates and progress tracking

4. **API & Backend**
   - RESTful API for all operations
   - Proper error handling and validation
   - Request/response logging
   - Health monitoring
   - API rate limiting and request validation
   - Input sanitization and file upload security

### Technical Requirements

1. **Backend**: FastAPI with Python 3.11.x
2. **Frontend**: React with TypeScript and Vite (or Vue.js/Angular)
3. **UI Components**: Radix UI with Tailwind CSS (preferred: shadcn/ui)
4. **Database**: MongoDB (preferred) or PostgreSQL with proper schema design
5. **File Processing**: Python-based document analysis with OCR
6. **Security**: JWT authentication, role-based access control, CORS, input validation
7. **Performance**: Redis caching, background job processing, async/await patterns
8. **Monitoring**: LLM Observability Tools for monitoring LLM calls and tool calls

## Success Criteria

- Users can upload and analyze financial documents with >90% accuracy
- System provides accurate data extraction with confidence scores
- Responsive, intuitive user interface with modern design
- Robust error handling and validation for all edge cases
- Scalable architecture for production deployment
- Complete frontend-backend integration
- Enterprise-grade security implementation
- Comprehensive testing coverage

## Current Status

- Basic FastAPI backend structure implemented (with bugs)
- React frontend with modern UI components (needs integration)
- Mock data endpoints for testing (need database integration)
- Database integration pending (PostgreSQL/Redis setup complete)
- Document analysis engine pending (CrewAI integration needed)
- Authentication system partially implemented
- **CRITICAL**: All code contains bugs and inefficiencies that need fixing
