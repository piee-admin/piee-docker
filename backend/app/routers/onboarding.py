"""
Onboarding endpoints for guiding new users through setup.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, OnboardingProgress, Organization, OrganizationMember
from app.auth.dependencies import get_current_active_user
from app.routers.schemas import (
    OnboardingStatusResponse,
    CompleteProfileRequest,
    OnboardingStepUpdate
)

router = APIRouter()


@router.get("/status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's onboarding progress.
    
    Returns:
        Onboarding status with completion flags for each step
    """
    progress = db.query(OnboardingProgress).filter(
        OnboardingProgress.user_id == current_user.id
    ).first()
    
    if not progress:
        # Create if missing (for existing users)
        progress = OnboardingProgress(
            user_id=current_user.id,
            organization_created=True  # Assume existing users have orgs
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    return {
        "completed": current_user.onboarding_completed,
        "current_step": current_user.onboarding_step,
        "steps": {
            "profile": progress.profile_completed,
            "organization": progress.organization_created,
            "provider_key": progress.provider_key_added,
            "first_prompt": progress.first_prompt_created
        }
    }


@router.post("/complete-profile")
async def complete_profile(
    data: CompleteProfileRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Complete user profile (Step 1 of onboarding).
    
    Updates user's full name, company, and role.
    Marks profile step as complete and advances to step 2.
    """
    # Update user profile
    current_user.full_name = data.full_name
    current_user.company_name = data.company_name
    current_user.role = data.role
    current_user.onboarding_step = max(current_user.onboarding_step, 1)
    
    # Update onboarding progress
    progress = db.query(OnboardingProgress).filter(
        OnboardingProgress.user_id == current_user.id
    ).first()
    
    if not progress:
        progress = OnboardingProgress(user_id=current_user.id)
        db.add(progress)
    
    progress.profile_completed = True
    
    db.commit()
    
    return {
        "message": "Profile completed successfully",
        "next_step": 2
    }


@router.post("/skip-onboarding")
async def skip_onboarding(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Skip onboarding and mark as completed.
    
    User can always return to complete individual steps later.
    """
    current_user.onboarding_completed = True
    current_user.onboarding_step = 4
    
    progress = db.query(OnboardingProgress).filter(
        OnboardingProgress.user_id == current_user.id
    ).first()
    
    if progress:
        progress.completed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Onboarding skipped successfully",
        "redirect": "/dashboard/overview"
    }


@router.post("/complete-onboarding")
async def complete_onboarding(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark onboarding as fully completed.
    
    Called when user finishes all 4 steps.
    """
    current_user.onboarding_completed = True
    current_user.onboarding_step = 4
    
    progress = db.query(OnboardingProgress).filter(
        OnboardingProgress.user_id == current_user.id
    ).first()
    
    if progress:
        progress.completed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Congratulations! Onboarding completed successfully",
        "redirect": "/dashboard/overview"
    }


@router.post("/update-step")
async def update_onboarding_step(
    data: OnboardingStepUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current onboarding step.
    
    Used for tracking progress as user moves through onboarding.
    """
    current_user.onboarding_step = data.step
    db.commit()
    
    return {
        "message": f"Onboarding step updated to {data.step}",
        "current_step": data.step
    }
