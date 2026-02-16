# PIEE Platform - Development Commands

.PHONY: help install dev-backend dev-frontend dev-all docker-up docker-up-pg docker-down docker-logs clean

help: ## Show this help message
	@echo "PIEE Platform - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# =============================================================================
# Installation
# =============================================================================

install: ## Install all dependencies (frontend + backend)
	@echo "📦 Installing frontend dependencies..."
	bun install
	@echo "📦 Installing backend dependencies..."
	cd backend && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
	@echo "✅ All dependencies installed!"

install-backend: ## Install backend dependencies only
	cd backend && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt

install-frontend: ## Install frontend dependencies only
	bun install

# =============================================================================
# Local Development (without Docker)
# =============================================================================

dev-backend: ## Run backend API server with hot reload
	cd backend && ./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Run frontend development server
	bun dev

dev-all: ## Run both backend and frontend (requires 2 terminals)
	@echo "Run these commands in separate terminals:"
	@echo "  Terminal 1: make dev-backend"
	@echo "  Terminal 2: make dev-frontend"

# =============================================================================
# Docker Commands
# =============================================================================

docker-up: ## Start all services with SQLite (default)
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"

docker-up-pg: ## Start all services with PostgreSQL
	docker-compose --profile postgres up -d
	@echo "✅ Services started with PostgreSQL!"
	@echo "   Frontend:   http://localhost:3000"
	@echo "   Backend:    http://localhost:8000"
	@echo "   API Docs:   http://localhost:8000/docs"
	@echo "   PostgreSQL: localhost:5432"

docker-down: ## Stop all services
	docker-compose --profile postgres down
	@echo "✅ Services stopped"

docker-logs: ## View logs from all services
	docker-compose logs -f

docker-logs-api: ## View backend API logs only
	docker-compose logs -f api

docker-logs-web: ## View frontend logs only
	docker-compose logs -f web

docker-restart: ## Restart all services
	docker-compose restart
	@echo "✅ Services restarted"

# =============================================================================
# Database Commands
# =============================================================================

db-init: ## Initialize database (create tables)
	cd backend && ./venv/bin/python3 -c "from app.db.base import init_db; init_db()"
	@echo "✅ Database initialized"

# =============================================================================
# Cleanup
# =============================================================================

clean: ## Clean up generated files and containers
	docker-compose --profile postgres down -v
	rm -rf backend/__pycache__ backend/**/__pycache__
	rm -rf backend/data
	@echo "✅ Cleanup complete"

clean-db: ## Delete database files
	rm -rf backend/data
	@echo "✅ Database files deleted"
