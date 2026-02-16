"""
Application configuration using Pydantic Settings.
Automatically loads from environment variables and .env file.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation."""
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/piee.db"
    
    # Security
    JWT_SECRET_KEY: str = "change-this-to-a-random-secret-key-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Storage
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "PIEE API"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )
    
    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite database."""
        return self.DATABASE_URL.startswith("sqlite")
    
    @property
    def is_postgres(self) -> bool:
        """Check if using PostgreSQL database."""
        return "postgresql" in self.DATABASE_URL
    
    @property
    def is_mysql(self) -> bool:
        """Check if using MySQL database."""
        return "mysql" in self.DATABASE_URL
    
    def ensure_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        # Create upload directory
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)
        
        # Create data directory for SQLite
        if self.is_sqlite:
            db_path = self.DATABASE_URL.replace("sqlite:///", "")
            db_dir = os.path.dirname(db_path)
            if db_dir:
                os.makedirs(db_dir, exist_ok=True)


# Create global settings instance
settings = Settings()
