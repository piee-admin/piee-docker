"""
Workspace management endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Workspace
from app.auth.dependencies import get_current_active_user
from app.routers.schemas import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse

router = APIRouter()


@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new workspace.
    
    Args:
        workspace_data: Workspace creation data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Created workspace
    """
    workspace = Workspace(
        user_id=current_user.id,
        name=workspace_data.name,
        description=workspace_data.description
    )
    
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    
    return workspace


@router.get("/", response_model=List[WorkspaceResponse])
async def list_workspaces(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all workspaces for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of workspaces
    """
    workspaces = db.query(Workspace).filter(
        Workspace.user_id == current_user.id
    ).order_by(Workspace.created_at.desc()).all()
    
    return workspaces


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific workspace by ID.
    
    Args:
        workspace_id: Workspace ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Workspace details
    
    Raises:
        HTTPException: If workspace not found or unauthorized
    """
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    return workspace


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    workspace_data: WorkspaceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a workspace.
    
    Args:
        workspace_id: Workspace ID
        workspace_data: Update data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Updated workspace
    
    Raises:
        HTTPException: If workspace not found or unauthorized
    """
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Update fields if provided
    if workspace_data.name is not None:
        workspace.name = workspace_data.name
    if workspace_data.description is not None:
        workspace.description = workspace_data.description
    
    db.commit()
    db.refresh(workspace)
    
    return workspace


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a workspace and all its associated files.
    
    Args:
        workspace_id: Workspace ID
        current_user: Current authenticated user
        db: Database session
    
    Raises:
        HTTPException: If workspace not found or unauthorized
    """
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    db.delete(workspace)
    db.commit()
    
    return None
