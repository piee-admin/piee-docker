"""
PIEE Platform Backend API
FastAPI application with internal database system.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Internal database API for PIEE platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:3000", 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    logger.info("🚀 Starting PIEE Backend API...")
    init_db()
    logger.info(f"✅ API ready at http://localhost:8000")
    logger.info(f"📚 Docs available at http://localhost:8000/docs")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "PIEE Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "database": "sqlite" if settings.is_sqlite else "postgresql" if settings.is_postgres else "mysql"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "database": "connected"
    }




# Register API routers
from app.routers import auth, files, workspaces, waitlist, organizations, prompts, executions, api_keys, provider_keys, onboarding

app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(onboarding.router, prefix=f"{settings.API_V1_PREFIX}/onboarding", tags=["Onboarding"])
app.include_router(files.router, prefix=f"{settings.API_V1_PREFIX}/files", tags=["Files"])
app.include_router(workspaces.router, prefix=f"{settings.API_V1_PREFIX}/workspaces", tags=["Workspaces"])
app.include_router(waitlist.router, prefix=f"{settings.API_V1_PREFIX}/waitlist", tags=["Waitlist"])
app.include_router(organizations.router, prefix=f"{settings.API_V1_PREFIX}/organizations", tags=["Organizations"])
app.include_router(prompts.router, prefix=f"{settings.API_V1_PREFIX}/prompts", tags=["Prompts"])
app.include_router(executions.router, prefix=f"{settings.API_V1_PREFIX}/executions", tags=["Execution"])
app.include_router(api_keys.router, prefix=f"{settings.API_V1_PREFIX}/api-keys", tags=["API Keys"])
app.include_router(provider_keys.router, prefix=f"{settings.API_V1_PREFIX}/provider-keys", tags=["Provider Keys (BYOK)"])

from app.routers import generations
app.include_router(generations.router, prefix=f"{settings.API_V1_PREFIX}/generations", tags=["Generations"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
