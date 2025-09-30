# Financial Document Analyzer - Backend Makefile
# Usage: make [target]
#
# Targets:
#   make start      - Start development server
#   make dev        - Start development server (alias for start)
#   make prod       - Start production server
#   make install    - Install dependencies
#   make test       - Run tests
#   make format     - Format code with black and isort
#   make lint       - Run linters
#   make clean      - Clean up cache and build files
#   make help       - Show this help message

.PHONY: help start dev prod install test format lint clean setup check

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Project settings
PYTHON := python3
VENV := venv
VENV_BIN := $(VENV)/bin
PYTHON_VENV := $(VENV_BIN)/python
PIP := $(VENV_BIN)/pip
UVICORN := $(VENV_BIN)/uvicorn

help: ## Show this help message
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)  Financial Document Analyzer - Backend Commands$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  make start      # Start development server"
	@echo "  make install    # Install all dependencies"
	@echo "  make test       # Run test suite"
	@echo ""

$(VENV): ## Create virtual environment
	@if [ ! -d "$(VENV)" ]; then \
		echo "$(YELLOW)→ Creating virtual environment...$(NC)"; \
		$(PYTHON) -m venv $(VENV); \
		echo "$(GREEN)✓ Virtual environment created$(NC)"; \
	fi

install: $(VENV) ## Install dependencies
	@echo "$(YELLOW)→ Installing dependencies...$(NC)"
	@$(PIP) install --upgrade pip
	@$(PIP) install -r requirements.txt
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

install-dev: $(VENV) ## Install dev dependencies
	@echo "$(YELLOW)→ Installing dev dependencies...$(NC)"
	@$(PIP) install --upgrade pip
	@$(PIP) install -r requirements.txt
	@$(PIP) install -e ".[dev]"
	@echo "$(GREEN)✓ Dev dependencies installed$(NC)"

setup: install ## Setup project (alias for install)
	@echo "$(GREEN)✓ Project setup complete$(NC)"

start: $(VENV) ## Start development server with auto-reload
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)🚀 Starting development server...$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Access points:$(NC)"
	@echo "  • API Root:    $(GREEN)http://localhost:8000$(NC)"
	@echo "  • Swagger UI:  $(GREEN)http://localhost:8000/docs$(NC)"
	@echo "  • ReDoc:       $(GREEN)http://localhost:8000/redoc$(NC)"
	@echo "  • Health:      $(GREEN)http://localhost:8000/health$(NC)"
	@echo ""
	@echo "$(YELLOW)Press Ctrl+C to stop the server$(NC)"
	@echo ""
	@$(UVICORN) app.main:app --reload --host 0.0.0.0 --port 8000

dev: start ## Start development server (alias for start)

prod: $(VENV) ## Start production server (no reload)
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)🚀 Starting production server...$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@$(UVICORN) app.main:app --host 0.0.0.0 --port 8000 --workers 4

run: start ## Run the server (alias for start)

check: $(VENV) ## Check if everything is working
	@echo "$(YELLOW)→ Checking Python version...$(NC)"
	@$(PYTHON_VENV) --version
	@echo "$(YELLOW)→ Checking dependencies...$(NC)"
	@$(PYTHON_VENV) -c "from app.main import app; print('$(GREEN)✓ Backend imports working$(NC)')"
	@echo "$(GREEN)✓ All checks passed$(NC)"

test: $(VENV) ## Run tests
	@echo "$(YELLOW)→ Running tests...$(NC)"
	@$(VENV_BIN)/pytest tests/ -v

test-cov: $(VENV) ## Run tests with coverage
	@echo "$(YELLOW)→ Running tests with coverage...$(NC)"
	@$(VENV_BIN)/pytest tests/ -v --cov=app --cov-report=html --cov-report=term

format: $(VENV) ## Format code with black and isort
	@echo "$(YELLOW)→ Formatting code...$(NC)"
	@$(VENV_BIN)/black app/
	@$(VENV_BIN)/isort app/
	@echo "$(GREEN)✓ Code formatted$(NC)"

lint: $(VENV) ## Run linters (flake8, mypy)
	@echo "$(YELLOW)→ Running linters...$(NC)"
	@$(VENV_BIN)/flake8 app/ --count --select=E9,F63,F7,F82 --show-source --statistics
	@$(VENV_BIN)/mypy app/ || true
	@echo "$(GREEN)✓ Linting complete$(NC)"

clean: ## Clean up cache and build files
	@echo "$(YELLOW)→ Cleaning up...$(NC)"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name "*.pyo" -delete 2>/dev/null || true
	@find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name ".coverage" -delete 2>/dev/null || true
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-all: clean ## Clean everything including venv
	@echo "$(YELLOW)→ Removing virtual environment...$(NC)"
	@rm -rf $(VENV)
	@echo "$(GREEN)✓ Complete cleanup done$(NC)"

shell: $(VENV) ## Start Python shell with app loaded
	@$(PYTHON_VENV) -i -c "from app.main import app; from app.config import settings; print('$(GREEN)FastAPI app loaded. Try: app, settings$(NC)')"

db-check: $(VENV) ## Check database connection
	@echo "$(YELLOW)→ Checking database connection...$(NC)"
	@$(PYTHON_VENV) -c "import asyncio; from app.database import check_mongodb_health; result = asyncio.run(check_mongodb_health()); print(result)"

freeze: $(VENV) ## Freeze dependencies to requirements.txt
	@echo "$(YELLOW)→ Freezing dependencies...$(NC)"
	@$(PIP) freeze > requirements.txt
	@echo "$(GREEN)✓ Dependencies frozen to requirements.txt$(NC)"

upgrade: $(VENV) ## Upgrade all dependencies
	@echo "$(YELLOW)→ Upgrading dependencies...$(NC)"
	@$(PIP) install --upgrade pip
	@$(PIP) list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 $(PIP) install -U
	@echo "$(GREEN)✓ Dependencies upgraded$(NC)"

logs: ## Show recent logs (if using systemd or docker)
	@echo "$(YELLOW)Logs not configured yet. Use Ctrl+C to see terminal output.$(NC)"

.PHONY: $(VENV)
