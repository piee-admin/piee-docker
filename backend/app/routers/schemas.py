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
    full_name: Optional[str] = None


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
    full_name: Optional[str]
    company_name: Optional[str]
    role: Optional[str]
    avatar_url: Optional[str]
    onboarding_completed: bool
    onboarding_step: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== Onboarding Schemas ==========

class CompleteProfileRequest(BaseModel):
    """Schema for completing user profile."""
    full_name: str = Field(..., min_length=1)
    company_name: Optional[str] = None
    role: Optional[str] = None


class OnboardingStepUpdate(BaseModel):
    """Schema for updating onboarding step."""
    step: int = Field(..., ge=0, le=4)


class OnboardingStatusResponse(BaseModel):
    """Schema for onboarding status response."""
    completed: bool
    current_step: int
    steps: dict
    
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


# ========== Organization Schemas ==========

class OrganizationCreate(BaseModel):
    """Schema for creating an organization."""
    name: str = Field(..., min_length=1, max_length=255)


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)


class OrganizationResponse(BaseModel):
    """Schema for organization response."""
    id: str
    name: str
    slug: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrganizationMemberResponse(BaseModel):
    """Schema for organization member response."""
    id: str
    org_id: str
    user_id: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== Prompt Schemas ==========

class PromptCreate(BaseModel):
    """Schema for creating a prompt."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class PromptVersionCreate(BaseModel):
    """Schema for creating a new prompt version."""
    content: str
    model: str
    provider: str
    parameters: Optional[str] = None


class PromptVersionResponse(BaseModel):
    """Schema for prompt version response."""
    id: str
    prompt_id: str
    version: int
    content: str
    model: str
    provider: str
    parameters: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class PromptResponse(BaseModel):
    """Schema for prompt response with latest version."""
    id: str
    org_id: str
    name: str
    slug: str
    description: Optional[str]
    created_at: datetime
    versions: List[PromptVersionResponse] = []
    
    class Config:
        from_attributes = True


# ========== Execution & Logging Schemas ==========

class PromptExecutionRequest(BaseModel):
    """Schema for prompt execution request via API or UI."""
    variables: Optional[dict] = None
    model_override: Optional[str] = None


class GenerationResponse(BaseModel):
    """Schema for generation log response."""
    id: str
    org_id: str
    prompt_id: Optional[str]
    prompt_version_id: Optional[str]
    user_id: Optional[str]
    input_variables: Optional[str] # JSON string
    output_text: str
    model: str
    tokens_prompt: int
    tokens_completion: int
    cost: int
    latency_ms: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== Credit & Usage Schemas ==========

class CreditLedgerResponse(BaseModel):
    """Schema for credit ledger entry response."""
    id: str
    org_id: str
    amount: int
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class CreditBalanceResponse(BaseModel):
    """Schema for organization credit balance."""
    org_id: str
    balance: int


# ========== API Key Schemas ==========

class APIKeyCreate(BaseModel):
    """Schema for creating an API key."""
    name: str = Field(..., min_length=1, max_length=255)


class APIKeyResponse(BaseModel):
    """Schema for API key response."""
    id: str
    org_id: str
    name: str
    prefix: str
    last_used_at: Optional[datetime]
    is_active: bool
    created_at: datetime
    # We never return the actual secret key hash
    
    class Config:
        from_attributes = True


class APIKeyCreatedResponse(APIKeyResponse):
    """Schema for newly created API key returning the secret key once."""
    secret_key: str


# ========== Provider Key Schemas (BYOK) ==========

class ProviderKeyCreate(BaseModel):
    """Schema for adding a provider API key."""
    provider: str = Field(..., description="Provider name: openai, anthropic, google, etc.")
    key_name: str = Field(..., min_length=1, max_length=255)
    api_key: str = Field(..., description="The actual API key to encrypt and store")


class ProviderKeyResponse(BaseModel):
    """Schema for provider key response (key is never returned)."""
    id: str
    org_id: str
    provider: str
    key_name: str
    key_prefix: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime]
    
    class Config:
        from_attributes = True
