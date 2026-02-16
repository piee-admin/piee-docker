"""
SQLAlchemy database setup with multi-database support.
Automatically detects and configures SQLite, PostgreSQL, or MySQL.
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

# Declarative base for all models
Base = declarative_base()


def get_engine():
    """
    Create SQLAlchemy engine with appropriate configuration based on database URL.
    Automatically detects SQLite, PostgreSQL, or MySQL and applies optimal settings.
    """
    database_url = settings.DATABASE_URL
    
    # Ensure necessary directories exist
    settings.ensure_directories()
    
    # SQLite configuration
    if settings.is_sqlite:
        db_path = database_url.replace("sqlite:///", "")
        logger.info(f"📦 Using SQLite database: {db_path}")
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},  # Required for SQLite
            echo=False  # Set to True for SQL query logging
        )
    
    # PostgreSQL configuration
    elif settings.is_postgres:
        logger.info("🐘 Using PostgreSQL database")
        engine = create_engine(
            database_url,
            pool_pre_ping=True,  # Verify connections before using
            pool_size=5,
            max_overflow=10,
            echo=False
        )
    
    # MySQL configuration
    elif settings.is_mysql:
        logger.info("🐬 Using MySQL database")
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            echo=False
        )
    
    else:
        raise ValueError(f"Unsupported database URL: {database_url}")
    
    return engine


# Create global engine instance
engine = get_engine()


def init_db():
    """
    Initialize database by creating all tables.
    This should be called on application startup.
    """
    logger.info("🔧 Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database initialized successfully")
