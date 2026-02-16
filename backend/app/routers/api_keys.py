"""
API Key management endpoints.
"""

import secrets
import hashlib
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, OrganizationMember, APIKey
from app.auth.dependencies import get_current_active_user
from app.routers.schemas import APIKeyCreate, APIKeyResponse, APIKeyCreatedResponse

router = APIRouter()

async def check_org_membership(org_id: str, user_id: str, db: Session):
    """Check if user belongs to organization."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return member

@router.post("/{org_id}", response_model=APIKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    org_id: str,
    key_data: APIKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new API key for an organization."""
    await check_org_membership(org_id, current_user.id, db)
    
    # Generate secret key
    secret_key = f"pk_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(secret_key.encode()).hexdigest()
    
    api_key = APIKey(
        org_id=org_id,
        name=key_data.name,
        prefix=secret_key[:10],
        key_hash=key_hash
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    
    # Return response with secret key (only once)
    response = APIKeyCreatedResponse(
        id=api_key.id,
        org_id=api_key.org_id,
        name=api_key.name,
        prefix=api_key.prefix,
        last_used_at=api_key.last_used_at,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        secret_key=secret_key
    )
    return response

@router.get("/{org_id}", response_model=List[APIKeyResponse])
async def list_api_keys(
    org_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all API keys for an organization."""
    await check_org_membership(org_id, current_user.id, db)
    
    keys = db.query(APIKey).filter(APIKey.org_id == org_id).all()
    return keys

@router.delete("/{org_id}/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    org_id: str,
    key_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deactivate/Revoke an API key."""
    await check_org_membership(org_id, current_user.id, db)
    
    api_key = db.query(APIKey).filter(APIKey.id == key_id, APIKey.org_id == org_id).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API Key not found")
        
    db.delete(api_key)
    db.commit()
    return None
