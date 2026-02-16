"""
File storage service for handling file uploads and management.
"""

import os
import uuid
import mimetypes
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings


def get_user_upload_dir(user_id: str) -> str:
    """
    Get the upload directory for a specific user.
    Creates the directory if it doesn't exist.
    
    Args:
        user_id: User ID
    
    Returns:
        Path to user's upload directory
    """
    user_dir = os.path.join(settings.UPLOAD_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)
    return user_dir


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename to prevent conflicts.
    
    Args:
        original_filename: Original filename from upload
    
    Returns:
        Unique filename with UUID prefix
    """
    # Get file extension
    _, ext = os.path.splitext(original_filename)
    
    # Generate unique ID
    unique_id = str(uuid.uuid4())
    
    # Combine ID with original name (sanitized)
    safe_name = "".join(c for c in original_filename if c.isalnum() or c in "._- ")
    return f"{unique_id}_{safe_name}"


async def save_upload_file(user_id: str, file: UploadFile) -> tuple[str, str, int]:
    """
    Save an uploaded file to disk.
    
    Args:
        user_id: User ID
        file: Uploaded file
    
    Returns:
        Tuple of (storage_path, filename, file_size)
    """
    # Generate unique filename
    filename = generate_unique_filename(file.filename or "unnamed")
    
    # Get user directory
    user_dir = get_user_upload_dir(user_id)
    
    # Full path
    storage_path = os.path.join(user_dir, filename)
    
    # Save file
    contents = await file.read()
    with open(storage_path, "wb") as f:
        f.write(contents)
    
    file_size = len(contents)
    
    return storage_path, filename, file_size


def delete_file(storage_path: str) -> bool:
    """
    Delete a file from disk.
    
    Args:
        storage_path: Full path to file
    
    Returns:
        True if deleted, False if file didn't exist
    """
    if os.path.exists(storage_path):
        os.remove(storage_path)
        return True
    return False


def get_mime_type(filename: str) -> str:
    """
    Get MIME type from filename.
    
    Args:
        filename: Filename to check
    
    Returns:
        MIME type string
    """
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or "application/octet-stream"
