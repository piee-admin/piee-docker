from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, OrganizationMember, Prompt, PromptVersion
from app.auth.dependencies import get_current_active_user, RoleChecker
from app.routers.schemas import PromptCreate, PromptResponse, PromptVersionCreate, PromptVersionResponse

router = APIRouter()

# Role checkers
check_member = RoleChecker(["member"]) # member, admin, or owner

def generate_slug(name: str) -> str:
    """Simple slug generator."""
    return name.lower().replace(" ", "-").replace("_", "-")

@router.post("/{org_id}", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    org_id: str,
    prompt_data: PromptCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_member)
):
    """Create a new prompt in an organization. Requires MEMBER role."""
    # Validate membership for this specific org
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")

    slug = generate_slug(prompt_data.name)
    prompt = Prompt(
        org_id=org_id,
        name=prompt_data.name,
        slug=slug,
        description=prompt_data.description
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    
    return prompt

@router.get("/{org_id}", response_model=List[PromptResponse])
async def list_prompts(
    org_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_member)
):
    """List all prompts for an organization. Requires MEMBER role."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    
    prompts = db.query(Prompt).filter(Prompt.org_id == org_id).all()
    return prompts

@router.post("/{org_id}/{prompt_id}/versions", response_model=PromptVersionResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt_version(
    org_id: str,
    prompt_id: str,
    version_data: PromptVersionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_member)
):
    """Create a new version for a prompt. Requires MEMBER role."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    
    # Check if prompt exists and belongs to org
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id, Prompt.org_id == org_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
        
    # Get latest version number
    latest = db.query(PromptVersion).filter(PromptVersion.prompt_id == prompt_id).order_by(PromptVersion.version.desc()).first()
    version_num = (latest.version + 1) if latest else 1
    
    version = PromptVersion(
        prompt_id=prompt_id,
        version=version_num,
        content=version_data.content,
        model=version_data.model,
        provider=version_data.provider,
        parameters=version_data.parameters
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    
    return version

@router.get("/{org_id}/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    org_id: str,
    prompt_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_member)
):
    """Get prompt details with all versions. Requires MEMBER role."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id, Prompt.org_id == org_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
        
    return prompt
