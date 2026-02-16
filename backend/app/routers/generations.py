"""
Generation history endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, OrganizationMember, Generation
from app.auth.dependencies import get_current_active_user, RoleChecker
from app.routers.schemas import GenerationResponse

router = APIRouter()

# Role checkers
check_viewer = RoleChecker(["viewer", "member", "admin", "owner"])

@router.get("/{org_id}", response_model=List[GenerationResponse])
async def list_generations(
    org_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_viewer)
):
    """List all generations for an organization. Requires VIEWER or higher role."""
    # Check specific membership
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
        
    generations = db.query(Generation).filter(
        Generation.org_id == org_id
    ).order_by(Generation.created_at.desc()).all()
    
    return generations
