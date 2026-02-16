"""
Execution engine endpoints for running prompts.
"""

import json
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import User, Organization, OrganizationMember, Prompt, PromptVersion, Generation, CreditLedger
from app.auth.dependencies import get_current_active_user, RoleChecker
from app.routers.schemas import PromptExecutionRequest, GenerationResponse
from app.services.providers import get_provider

router = APIRouter()

# Role checkers
check_member = RoleChecker(["member"]) # member, admin, or owner

def resolve_variables(content: str, variables: dict) -> str:
    """Replace ${var} with values from variables dict."""
    if not variables:
        return content
    for key, value in variables.items():
        content = content.replace(f"${{{key}}}", str(value))
    return content

async def get_org_balance(org_id: str, db: Session) -> int:
    """Calculate current credit balance from ledger."""
    balance = db.query(func.sum(CreditLedger.amount)).filter(CreditLedger.org_id == org_id).scalar()
    return balance or 0

@router.post("/{org_id}/{prompt_id}/execute", response_model=GenerationResponse)
async def execute_prompt(
    org_id: str,
    prompt_id: str,
    exec_data: PromptExecutionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    _ = Depends(check_member)
):
    """Execute the latest version of a prompt using BYOK provider keys. Requires MEMBER role."""
    from app.db.models import ProviderKey
    from app.services.encryption import decrypt_api_key
    
    # Check specific membership
    member = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    
    # Check balance
    balance = await get_org_balance(org_id, db)
    if balance <= 0:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    # Get latest prompt version
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id, Prompt.org_id == org_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
        
    version = db.query(PromptVersion).filter(PromptVersion.prompt_id == prompt_id).order_by(PromptVersion.version.desc()).first()
    if not version:
        raise HTTPException(status_code=400, detail="Prompt has no versions")
    
    # Get provider API key from BYOK
    provider_key = db.query(ProviderKey).filter(
        ProviderKey.org_id == org_id,
        ProviderKey.provider == version.provider,
        ProviderKey.is_active == True
    ).first()
    
    if not provider_key:
        raise HTTPException(
            status_code=400,
            detail=f"No active API key found for provider '{version.provider}'. Please add one in Settings > Providers."
        )
    
    # Decrypt the API key
    try:
        api_key = decrypt_api_key(provider_key.encrypted_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to decrypt API key: {str(e)}")
        
    # Resolve variables
    final_prompt = resolve_variables(version.content, exec_data.variables or {})
    
    # Call provider with decrypted key
    provider = get_provider(version.provider)
    model = exec_data.model_override or version.model
    
    try:
        result = await provider.generate(final_prompt, model, api_key, version.parameters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Provider API call failed: {str(e)}")
    
    # Update last_used_at for provider key
    provider_key.last_used_at = datetime.utcnow()
    
    # Log generation
    generation = Generation(
        org_id=org_id,
        prompt_id=prompt_id,
        prompt_version_id=version.id,
        user_id=current_user.id,
        input_variables=json.dumps(exec_data.variables) if exec_data.variables else None,
        output_text=result["text"],
        model=result["model"],
        tokens_prompt=result["tokens_prompt"],
        tokens_completion=result["tokens_completion"],
        cost=result["cost"],
        latency_ms=result["latency_ms"]
    )
    db.add(generation)
    
    # Deduct credits
    deduction = CreditLedger(
        org_id=org_id,
        amount=-result["cost"],
        description=f"Execution of prompt: {prompt.name} (v{version.version})"
    )
    db.add(deduction)
    
    db.commit()
    db.refresh(generation)
    
    return generation
