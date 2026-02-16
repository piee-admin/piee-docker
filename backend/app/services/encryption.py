"""
Encryption utilities for secure API key storage.
"""

import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

def get_encryption_key() -> bytes:
    """
    Get or generate encryption key from environment.
    In production, this should come from a secure key management system.
    """
    master_key = os.getenv("ENCRYPTION_MASTER_KEY")
    if not master_key:
        # For development, generate a key (NOT for production!)
        master_key = base64.urlsafe_b64encode(os.urandom(32)).decode()
        print(f"⚠️  WARNING: Using generated encryption key. Set ENCRYPTION_MASTER_KEY in production!")
    
    # Derive a Fernet key from the master key
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'piee_salt_v1',  # In production, use a random salt per key
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(master_key.encode()))
    return key

def encrypt_api_key(api_key: str) -> str:
    """Encrypt an API key for storage."""
    f = Fernet(get_encryption_key())
    encrypted = f.encrypt(api_key.encode())
    return encrypted.decode()

def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an API key for use."""
    f = Fernet(get_encryption_key())
    decrypted = f.decrypt(encrypted_key.encode())
    return decrypted.decode()
