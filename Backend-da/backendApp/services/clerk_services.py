# backend/app/dependencies.py

import asyncio
from datetime import date
import os
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer
from typing import Dict, List, Optional
from clerk_backend_api import Clerk
from clerk_backend_api.security import AuthenticateRequestOptions
from dotenv import load_dotenv
from decimal import Decimal, InvalidOperation  # <-- Import Decimal

load_dotenv()

# --- Clerk and Security Scheme Initialization ---
clerk_secret_key = os.getenv("CLERK_SECRET_KEY")
if not clerk_secret_key:
    raise ValueError("CLERK_SECRET_KEY is not set.")
clerk_sdk = Clerk(bearer_auth=clerk_secret_key)
security_scheme = HTTPBearer()


# --- Dependency Functions ---
async def get_current_user_claims(req: Request) -> Dict:
    options = AuthenticateRequestOptions()
    try:
        request_state = clerk_sdk.authenticate_request(req, options)
        if not request_state.is_signed_in:
            raise HTTPException(
                status_code=401, detail="Unauthorized: Not signed in")
        return request_state.payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")
