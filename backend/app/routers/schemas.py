"""
Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, model_validator
from app.core.config import settings


# ========== Auth Schemas ==========

class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema for user data response."""
    id: str
    email: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== Workspace Schemas ==========

class WorkspaceCreate(BaseModel):
    """Schema for creating a workspace."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class WorkspaceUpdate(BaseModel):
    """Schema for updating a workspace."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class WorkspaceResponse(BaseModel):
    """Schema for workspace response."""
    id: str
    user_id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== File Schemas ==========

class FileResponse(BaseModel):
    """Schema for file metadata response."""
    id: str
    user_id: str
    workspace_id: Optional[str]
    filename: str
    original_filename: str
    mime_type: str
    size_bytes: int
    created_at: datetime
    
    # Computed fields for frontend compatibility
    file_name: str = ""
    size: int = 0
    public_url: str = ""
    thumbnail_url: str = ""
    
    @model_validator(mode='after')
    def set_computed_fields(self):
        """Set fields that the frontend expects."""
        self.file_name = self.original_filename
        self.size = self.size_bytes
        
        # Determine base URL dynamically (would ideally come from request/settings)
        # In a real app, this should probably be provided via context or a global setting
        base_url = settings.FRONTEND_URL # Using FRONTEND_URL as a base for public links if appropriate, or a dedicated API_URL
        # Actually, let's stick to the port 8000 for local dev consistency
        api_base = "http://localhost:8000"
        self.public_url = f"{api_base}/api/v1/files/{self.id}/download"
        
        # Simple thumbnail logic
        if self.mime_type.startswith("image/"):
            self.thumbnail_url = self.public_url
        else:
            self.thumbnail_url = "" # Frontend uses icons for non-images
            
        return self
    
    class Config:
        from_attributes = True


class FileStatsResponse(BaseModel):
    """Schema for file statistics response."""
    total_count: int
    total_storage_used: int


class FilesListResponse(BaseModel):
    """Schema for file list response."""
    files: List[FileResponse]


# ========== Waitlist Schemas ==========
class WaitlistCreate(BaseModel):
    """Schema for waitlist creation."""
    email: EmailStr

class WaitlistResponse(BaseModel):
    """Schema for waitlist response."""
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
