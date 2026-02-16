"""
File management endpoints for upload, download, and listing.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, File
from app.auth.dependencies import get_current_active_user
from app.routers.schemas import (
    FileResponse as FileResponseSchema,
    FilesListResponse,
    FileStatsResponse
)
from app.services.file_storage import save_upload_file, delete_file, get_mime_type
from sqlalchemy import func
from app.core.config import settings
import os

router = APIRouter()


@router.post("/upload", response_model=FileResponseSchema, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    workspace_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file and store its metadata.
    
    Args:
        file: File to upload
        workspace_id: Optional workspace ID to associate with
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        File metadata
    
    Raises:
        HTTPException: If file is too large or upload fails
    """
    # Check file size
    contents = await file.read()
    file_size = len(contents)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE} bytes"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    # Save file to disk
    storage_path, filename, _ = await save_upload_file(current_user.id, file)
    
    # Get MIME type
    mime_type = get_mime_type(file.filename or "")
    
    # Create database record
    db_file = File(
        user_id=current_user.id,
        workspace_id=workspace_id,
        filename=filename,
        original_filename=file.filename or "unnamed",
        storage_path=storage_path,
        mime_type=mime_type,
        size_bytes=file_size
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file


@router.get("/", response_model=FilesListResponse)
async def list_files(
    workspace_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all files for the current user.
    
    Args:
        workspace_id: Optional workspace ID to filter by
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of file metadata
    """
    query = db.query(File).filter(File.user_id == current_user.id)
    
    if workspace_id:
        query = query.filter(File.workspace_id == workspace_id)
    
    files = query.order_by(File.created_at.desc()).all()
    return {"files": files}


@router.get("/stats", response_model=FileStatsResponse)
async def get_file_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get file statistics for the current user.
    """
    stats = db.query(
        func.count(File.id).label("total_count"),
        func.sum(File.size_bytes).label("total_storage_used")
    ).filter(File.user_id == current_user.id).first()
    
    return {
        "total_count": stats.total_count or 0,
        "total_storage_used": stats.total_storage_used or 0
    }


@router.get("/{file_id}", response_model=FileResponseSchema)
async def get_file_metadata(
    file_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get file metadata by ID.
    
    Args:
        file_id: File ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        File metadata
    
    Raises:
        HTTPException: If file not found or unauthorized
    """
    file = db.query(File).filter(
        File.id == file_id,
        File.user_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return file


@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Download a file by ID.
    
    Args:
        file_id: File ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        File content
    
    Raises:
        HTTPException: If file not found or unauthorized
    """
    file = db.query(File).filter(
        File.id == file_id,
        File.user_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if not os.path.exists(file.storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return FileResponse(
        path=file.storage_path,
        filename=file.original_filename,
        media_type=file.mime_type
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file_endpoint(
    file_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a file and its metadata.
    
    Args:
        file_id: File ID
        current_user: Current authenticated user
        db: Database session
    
    Raises:
        HTTPException: If file not found or unauthorized
    """
    file = db.query(File).filter(
        File.id == file_id,
        File.user_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Delete file from disk
    delete_file(file.storage_path)
    
    # Delete from database
    db.delete(file)
    db.commit()
    
    return None
