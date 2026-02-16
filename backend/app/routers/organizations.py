from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Organization, OrganizationMember
from app.auth.dependencies import get_current_active_user, RoleChecker
from app.routers.schemas import OrganizationCreate, OrganizationUpdate, OrganizationResponse, OrganizationMemberResponse

router = APIRouter()

# Role checkers
check_admin = RoleChecker(["admin"]) 
check_member = RoleChecker(["member"])

def generate_slug(name: str) -> str:
    """Simple slug generator."""
    return name.lower().replace(" ", "-").replace("_", "-")

@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new organization and add the creator as owner."""
    slug = generate_slug(org_data.name)
    
    # Check if slug exists
    existing = db.query(Organization).filter(Organization.slug == slug).first()
    if existing:
        import uuid
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        
    org = Organization(
        name=org_data.name,
        slug=slug
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    
    # Add creator as owner
    member = OrganizationMember(
        org_id=org.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(member)
    db.commit()
    
    return org

@router.get("/", response_model=List[OrganizationResponse])
async def list_organizations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all organizations the user belongs to."""
    orgs = db.query(Organization).join(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).all()
    return orgs

@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: str,
    org_data: OrganizationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_admin)
):
    """Update organization details (requires ADMIN or OWNER)."""
    # Check specific membership
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member or member.role not in ["admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
        
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    if org_data.name:
        org.name = org_data.name
        new_slug = generate_slug(org_data.name)
        if new_slug != org.slug:
            existing = db.query(Organization).filter(Organization.slug == new_slug).first()
            if existing:
                import uuid
                new_slug = f"{new_slug}-{str(uuid.uuid4())[:8]}"
            org.slug = new_slug
            
    db.commit()
    db.refresh(org)
    return org

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_member)
):
    """Get organization details if the user is a member."""
    # Check specific membership
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization"
        )
        
    org = db.query(Organization).filter(Organization.id == org_id).first()
    return org
