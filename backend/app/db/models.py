"""
SQLAlchemy database models for PIEE platform.
Replaces Supabase tables with internal database schema.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


def generate_uuid():
    """Generate UUID as string for compatibility across databases."""
    return str(uuid.uuid4())


class User(Base):
    """User account model."""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Profile fields
    full_name = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    role = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Onboarding tracking
    onboarding_completed = Column(Boolean, default=False, nullable=False)
    onboarding_step = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    workspaces = relationship("Workspace", back_populates="user", cascade="all, delete-orphan")
    files = relationship("File", back_populates="user", cascade="all, delete-orphan")
    org_memberships = relationship("OrganizationMember", back_populates="user", cascade="all, delete-orphan")


class Organization(Base):
    """Organization model for multi-tenancy."""
    __tablename__ = "organizations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    prompts = relationship("Prompt", back_populates="organization", cascade="all, delete-orphan")
    generations = relationship("Generation", back_populates="organization", cascade="all, delete-orphan")
    credit_ledger = relationship("CreditLedger", back_populates="organization", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="organization", cascade="all, delete-orphan")
    provider_keys = relationship("ProviderKey", back_populates="organization", cascade="all, delete-orphan")


class OrganizationMember(Base):
    """Link between Users and Organizations with roles."""
    __tablename__ = "organization_members"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="member", nullable=False) # owner, member, api_consumer
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="members")
    user = relationship("User", back_populates="org_memberships")


class Prompt(Base):
    """Prompt management model."""
    __tablename__ = "prompts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="prompts")
    versions = relationship("PromptVersion", back_populates="prompt", cascade="all, delete-orphan")


class PromptVersion(Base):
    """Immutable versioning for prompts."""
    __tablename__ = "prompt_versions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    prompt_id = Column(String(36), ForeignKey("prompts.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, nullable=False)
    content = Column(Text, nullable=False) # Content with ${variable} placeholders
    model = Column(String(100), nullable=False)
    provider = Column(String(100), nullable=False)
    parameters = Column(Text, nullable=True) # JSON strings for temperature, tokens, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    prompt = relationship("Prompt", back_populates="versions")


class Generation(Base):
    """Immutable log of prompt executions."""
    __tablename__ = "generations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    prompt_id = Column(String(36), ForeignKey("prompts.id", ondelete="SET NULL"), nullable=True)
    prompt_version_id = Column(String(36), ForeignKey("prompt_versions.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    input_variables = Column(Text, nullable=True) # JSON of provided variables
    output_text = Column(Text, nullable=False)
    model = Column(String(100), nullable=False)
    tokens_prompt = Column(Integer, default=0)
    tokens_completion = Column(Integer, default=0)
    cost = Column(Integer, default=0) # Stored in micro-credits or smallest unit
    latency_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="generations")


class CreditLedger(Base):
    """Append-only credit ledger for balance calculation."""
    __tablename__ = "credit_ledger"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False) # Positive for recharge, negative for usage
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="credit_ledger")


class APIKey(Base):
    """Hashed API keys for secure developer access."""
    __tablename__ = "api_keys"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    prefix = Column(String(10), nullable=False) # e.g., 'pk_...'
    last_used_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="api_keys")


class ProviderKey(Base):
    """Provider API key model for BYOK (Bring Your Own Key)."""
    __tablename__ = "provider_keys"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # openai, anthropic, google, etc.
    key_name = Column(String(255), nullable=False)  # User-friendly name
    encrypted_key = Column(Text, nullable=False)  # Encrypted API key
    key_prefix = Column(String(20), nullable=True)  # First few chars for identification
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="provider_keys")


# Existing models kept for now
class Session(Base):
    """Authentication session model for JWT tokens."""
    __tablename__ = "sessions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="sessions")


class Workspace(Base):
    """Workspace model for organizing user content."""
    __tablename__ = "workspaces"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="workspaces")
    files = relationship("File", back_populates="workspace", cascade="all, delete-orphan")


class File(Base):
    """File metadata model for file storage tracking."""
    __tablename__ = "files"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String(255), nullable=False)  # Stored filename
    original_filename = Column(String(255), nullable=False)  # Original upload name
    storage_path = Column(String(500), nullable=False)  # Full path to file
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="files")
    workspace = relationship("Workspace", back_populates="files")


class Waitlist(Base):
    """Waitlist model for early signups."""
    __tablename__ = "waitlist"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class OnboardingProgress(Base):
    """Track user onboarding progress."""
    __tablename__ = "onboarding_progress"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Step completion flags
    profile_completed = Column(Boolean, default=False, nullable=False)
    organization_created = Column(Boolean, default=False, nullable=False)
    provider_key_added = Column(Boolean, default=False, nullable=False)
    first_prompt_created = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="onboarding_progress")


class OrganizationInvitation(Base):
    """Invitations to join organizations."""
    __tablename__ = "organization_invitations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), default="member", nullable=False)
    invited_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(String(20), default="pending", nullable=False)  # pending, accepted, expired
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    organization = relationship("Organization", backref="invitations")
    inviter = relationship("User", foreign_keys=[invited_by])
