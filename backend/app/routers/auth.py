"""
Authentication endpoints for user registration and login.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.auth.security import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_active_user
from app.routers.schemas import UserRegister, UserLogin, Token, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.
    """
    from app.db.models import Organization, OrganizationMember, OnboardingProgress
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        onboarding_completed=False,
        onboarding_step=0
    )
    
    db.add(new_user)
    db.flush()  # Get user ID without committing
    
    # Create personal organization
    org_name = f"{user_data.full_name or 'My'}'s Organization"
    slug = org_name.lower().replace(" ", "-").replace("'", "")
    
    # Ensure unique slug
    existing_org = db.query(Organization).filter(Organization.slug == slug).first()
    if existing_org:
        import uuid
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    
    org = Organization(
        name=org_name,
        slug=slug
    )
    db.add(org)
    db.flush()
    
    # Add user as owner
    member = OrganizationMember(
        org_id=org.id,
        user_id=new_user.id,
        role="owner"
    )
    db.add(member)
    
    # Initialize onboarding progress
    onboarding = OnboardingProgress(
        user_id=new_user.id,
        organization_created=True  # Auto-completed since we just created it
    )
    db.add(onboarding)
    
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login and receive JWT access token.
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user information.
    """
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """
    Logout current user.
    """
    return {"message": "Successfully logged out"}
