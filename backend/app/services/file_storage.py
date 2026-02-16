"""
File storage service for handling file uploads and management.
"""

import os
import uuid
import mimetypes
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings

import json
import shutil
from pathlib import Path
from hachoir.parser import createParser
from hachoir.metadata import extractMetadata
import magic

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


async def save_upload_file(user_id: str, file: UploadFile) -> tuple[str, str, int, Optional[str], str]:
    """
    Save an uploaded file to disk using streaming.
    
    Args:
        user_id: User ID
        file: Uploaded file
    
    Returns:
        Tuple of (storage_path, filename, file_size, metadata_json, mime_type)
    """
    # Generate unique filename
    filename = generate_unique_filename(file.filename or "unnamed")
    
    # Get user directory
    user_dir = get_user_upload_dir(user_id)
    
    # Full path
    storage_path = os.path.join(user_dir, filename)
    
    # Save file using streaming to avoid memory issues
    try:
        with open(storage_path, "wb") as buffer:
            while content := await file.read(1024 * 1024):  # Read in 1MB chunks
                buffer.write(content)
    except Exception as e:
        # Cleanup if save fails
        if os.path.exists(storage_path):
            os.remove(storage_path)
        raise e
    
    file_size = os.path.getsize(storage_path)
    
    # Detect MIME type properly
    mime_type = get_mime_type(storage_path)
    
    # Extract metadata
    metadata = extract_file_metadata(storage_path)
    metadata_json = json.dumps(metadata) if metadata else None
    
    return storage_path, filename, file_size, metadata_json, mime_type


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


def get_mime_type(file_path: str) -> str:
    """
    Get MIME type from file content using python-magic.
    Falls back to mimetypes if magic fails or file doesn't exist.
    """
    try:
        return magic.from_file(file_path, mime=True)
    except Exception:
        mime_type, _ = mimetypes.guess_type(file_path)
        return mime_type or "application/octet-stream"


def extract_file_metadata(file_path: str) -> Optional[dict]:
    """
    Extract metadata from file using Hachoir.
    Supports video, audio, image, etc.
    """
    try:
        parser = createParser(file_path)
        if not parser:
            return None

        with parser:
            metadata = extractMetadata(parser)
            if not metadata:
                return None
            
            data = {}
            # Common fields
            if metadata.has("duration"):
                data["duration"] = str(metadata.get("duration"))
            if metadata.has("width") and metadata.has("height"):
                data["width"] = metadata.get("width")
                data["height"] = metadata.get("height")
                data["resolution"] = f"{data['width']}x{data['height']}"
            if metadata.has("frame_rate"):
                data["frame_rate"] = metadata.get("frame_rate")
            if metadata.has("bit_rate"):
                data["bit_rate"] = metadata.get("bit_rate")
            if metadata.has("producer"):
                data["producer"] = metadata.get("producer")
            if metadata.has("camera_model"):
                data["camera_model"] = metadata.get("camera_model")
                
            return data
    except Exception:
        return None
