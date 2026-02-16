"""
FastAPI dependencies for authentication.
Provides current user extraction from JWT tokens.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.auth.security import decode_access_token

# Security scheme for JWT bearer tokens
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        credentials: Bearer token from Authorization header
        db: Database session
    
    Returns:
        User object if authenticated
    
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode the token
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get the current active user (must be active and authenticated).
    
    Args:
        current_user: User from get_current_user dependency
    
    Returns:
        User object if active
    
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_optional_user(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[User]:
    """
    Get current user if token is provided, otherwise return None.
    Useful for endpoints that work both authenticated and unauthenticated.
    
    Args:
        db: Database session
        credentials: Optional bearer token
    
    Returns:
        User object if authenticated, None otherwise
    """
    if credentials is None:
        return None
    
    try:
        user = await get_current_user(credentials, db)
        return user
    except HTTPException:
        return None


async def get_current_user_with_org(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user with their primary organization.
    
    Returns tuple of (User, Organization).
    Raises 400 if user has no organization (shouldn't happen with new registration flow).
    
    Args:
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Tuple of (User, Organization)
    
    Raises:
        HTTPException: If user has no organization
    """
    from app.db.models import Organization, OrganizationMember
    
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no organization. Please contact support."
        )
    
    org = db.query(Organization).filter(
        Organization.id == membership.org_id
    ).first()
    
    return current_user, org


class RoleChecker:
    """
    Dependency to check if a user has the required role (or higher) in an organization.
    Usage: Depends(RoleChecker(["admin", "owner"])) or Depends(RoleChecker("admin"))
    """
    def __init__(self, allowed_roles: list[str] | str):
        if isinstance(allowed_roles, str):
            self.allowed_roles = [allowed_roles]
        else:
            self.allowed_roles = allowed_roles

    # Role hierarchy: owner > admin > member > viewer
    ROLE_HIERARCHY = {
        "owner": 4,
        "admin": 3,
        "member": 2,
        "viewer": 1
    }

    def __call__(self, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
        from app.db.models import OrganizationMember
        
        # Get membership (assuming single org context for now, or primary org)
        # In a real multi-org setup, org_id should be passed as a path param, 
        # but for simplicity we'll check the user's primary/active membership.
        # Ideally, we should check against the org_id in the URL path if present.
        
        member = db.query(OrganizationMember).filter(
            OrganizationMember.user_id == user.id
        ).first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of any organization"
            )

        user_role_level = self.ROLE_HIERARCHY.get(member.role, 0)
        
        # Check if user has ANY of the allowed roles (or higher)
        # We can implement this as: if "admin" is allowed, then "owner" is also allowed.
        # Let's find the minimum required level from allowed_roles.
        
        min_required_level = 0
        for role in self.allowed_roles:
            level = self.ROLE_HIERARCHY.get(role, 99)
            if level < 99:
                # We assume allowed_roles usually contains just one minimum role, like "admin"
                # If multiple are passed, we might want to check against specific ones.
                # But typically RBAC is hierarchical.
                # If we say Depends(RoleChecker("admin")), we mean admin OR owner.
                min_required_level = level
                break
        
        if user_role_level < min_required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {self.allowed_roles}"
            )
            
        return member
