from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, OrganizationMember, ProviderKey
from app.auth.dependencies import get_current_active_user, RoleChecker
from app.routers.schemas import ProviderKeyCreate, ProviderKeyResponse
from app.services.encryption import encrypt_api_key

router = APIRouter()

# Role checkers
check_admin = RoleChecker(["admin"]) # admin or owner
check_member = RoleChecker(["member"]) # member, admin, or owner

@router.post("/{org_id}", response_model=ProviderKeyResponse, status_code=status.HTTP_201_CREATED)
async def add_provider_key(
    org_id: str,
    key_data: ProviderKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_admin)
):
    """Add a new provider API key (BYOK). Requires ADMIN or OWNER role."""
    # Note: RoleChecker validates membership but doesn't strictly check org_id match unless we pass it.
    # Current RoleChecker gets user's membership. 
    # TODO: Enhance RoleChecker to validate org_id context if needed.
    # For now, explicit check:
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member or member.role not in ["admin", "owner"]:
        # Double check in case RoleChecker passed via loop but context mismatch
        # Actually RoleChecker as is checks ANY membership. 
        # We need to check SPECIFIC org membership.
        # Let's refine check_org_membership logic inside endpoints for now combined with RoleChecker concept.
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Encrypt the API key
    encrypted = encrypt_api_key(key_data.api_key)
    
    # Store prefix for identification (first 10 chars)
    prefix = key_data.api_key[:10] if len(key_data.api_key) >= 10 else key_data.api_key[:4]
    
    provider_key = ProviderKey(
        org_id=org_id,
        provider=key_data.provider,
        key_name=key_data.key_name,
        encrypted_key=encrypted,
        key_prefix=prefix
    )
    db.add(provider_key)
    db.commit()
    db.refresh(provider_key)
    
    return provider_key

@router.get("/{org_id}", response_model=List[ProviderKeyResponse])
async def list_provider_keys(
    org_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_member)
):
    """List all provider keys for an organization (keys are masked). Requires MEMBER role."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
         raise HTTPException(status_code=403, detail="Not a member of this organization")

    keys = db.query(ProviderKey).filter(ProviderKey.org_id == org_id).all()
    return keys

@router.delete("/{org_id}/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_provider_key(
    org_id: str,
    key_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_admin)
):
    """Delete a provider key. Requires ADMIN or OWNER role."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member or member.role not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    key = db.query(ProviderKey).filter(
        ProviderKey.id == key_id,
        ProviderKey.org_id == org_id
    ).first()
    
    if not key:
        raise HTTPException(status_code=404, detail="Provider key not found")
    
    db.delete(key)
    db.commit()
    return None
