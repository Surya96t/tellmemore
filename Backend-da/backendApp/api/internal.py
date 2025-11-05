# --- File: backendApp/api/internal.py ---
# Internal API endpoints for BFF → Backend-da communication
# These endpoints are NOT protected by Clerk auth and should only be called by the trusted BFF layer

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from backendApp.schemas.user_schemas import UserResponse
from backendApp.schemas.chat_session_schemas import ChatSessionCreate, ChatSessionResponse
from backendApp.schemas.prompt_schemas import PromptCreate, PromptResponse
from backendApp.services.user_service import UserService
from backendApp.services.chat_session_service import ChatSessionService
from backendApp.services.prompt_service import PromptService
from backendApp.services.quota_service import QuotaService
from backendApp.services.user_prompt_service import UserPromptService
from backendApp.dependencies import get_db
import os
import uuid
from typing import List

router = APIRouter()
user_service = UserService()
chat_session_service = ChatSessionService()
prompt_service = PromptService()
quota_service = QuotaService()
user_prompt_service = UserPromptService()

# Internal API key for BFF authentication
INTERNAL_API_KEY = os.getenv(
    "INTERNAL_API_KEY", "dev-internal-key-change-in-production")


def verify_api_key(x_internal_api_key: str = Header(None, alias="X-Internal-API-Key")):
    """Helper to verify internal API key"""
    if x_internal_api_key != INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key"
        )


@router.get("/users/by-clerk-id/{clerk_user_id}", response_model=UserResponse)
def get_or_create_user_by_clerk_id_api(
    clerk_user_id: str,
    clerk_email: str = None,
    clerk_name: str = None,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Get or create a user by Clerk ID.
    This endpoint is for internal BFF use only and requires an API key.

    Args:
        clerk_user_id: The Clerk user ID (e.g., "user_2abc...")
        clerk_email: Optional email from Clerk profile (query param)
        clerk_name: Optional name from Clerk profile (query param)

    Returns:
        UserResponse: User object with user_id (UUID)
    """
    # Use real Clerk data if provided, otherwise fall back to placeholders
    email = clerk_email if clerk_email else f"{clerk_user_id}@clerk.temp"
    name = clerk_name if clerk_name else "Clerk User"

    # Get or create user
    user = user_service.get_or_create_user_by_clerk_id(
        db,
        clerk_user_id=clerk_user_id,
        clerk_email=email,
        clerk_name=name,
        clerk_role="user"
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

    return user


@router.get("/users/{user_id}/sessions", response_model=List[ChatSessionResponse])
def get_user_sessions_api(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Get all sessions for a user by user_id.
    Internal endpoint for BFF use only.
    """
    sessions = chat_session_service.get_user_chat_sessions(db, user_id)
    return sessions


@router.post("/sessions", response_model=ChatSessionResponse)
def create_session_api(
    session: ChatSessionCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Create a new session.
    Internal endpoint for BFF use only.
    """
    db_session = chat_session_service.create_chat_session(db, session)
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session"
        )
    return db_session


@router.get("/sessions/{session_id}/prompts", response_model=List[PromptResponse])
def get_session_prompts_api(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Get all prompts (chat history) for a session.
    Internal endpoint for BFF use only.
    """
    prompts = prompt_service.get_session_prompts(db, session_id)
    return prompts


@router.post("/prompts", response_model=PromptResponse)
def create_prompt_api(
    prompt: PromptCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Create a new prompt with LLM responses.
    Internal endpoint for BFF use only.

    The PromptCreate schema should include:
    - user_id: UUID (from BFF)
    - session_id: UUID
    - prompt_text: str
    - llm_responses: List[str]
    """
    db_prompt = prompt_service.create_prompt(db, prompt)
    if not db_prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User or Chat Session not found for this prompt"
        )
    return db_prompt


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session_by_id_api(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Get session by ID.
    Internal endpoint for BFF use only.
    """
    session = chat_session_service.get_chat_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return session


@router.put("/sessions/{session_id}", response_model=ChatSessionResponse)
def update_session_api(
    session_id: uuid.UUID,
    session_update: dict,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Update session (e.g., title).
    Internal endpoint for BFF use only.

    Expects: { "title": "new title" }
    """
    from backendApp.schemas.chat_session_schemas import ChatSessionBase

    # Convert dict to ChatSessionBase (only title is required)
    session_data = ChatSessionBase(**session_update)
    updated_session = chat_session_service.update_chat_session(
        db, session_id, session_data
    )
    if not updated_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return updated_session


@router.delete("/sessions/{session_id}")
def delete_session_api(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Delete session by ID.
    Internal endpoint for BFF use only.
    """
    success = chat_session_service.delete_chat_session(db, session_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return {"message": "Session deleted successfully"}


@router.get("/users/{user_id}/quota")
def get_user_quota_api(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Get user quota by user_id.
    Internal endpoint for BFF use only.
    """
    quota = quota_service.get_user_quota(db, user_id)
    if not quota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quota not found for this user"
        )
    return quota


@router.put("/users/{user_id}/quota")
def update_user_quota_api(
    user_id: uuid.UUID,
    quota_update: dict,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Update user quota.
    Internal endpoint for BFF use only.
    """
    from backendApp.schemas.user_schemas import QuotaBase
    quota_data = QuotaBase(**quota_update)
    updated_quota = user_service.update_user_quota(db, user_id, quota_data)
    if not updated_quota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quota not found for this user"
        )
    return updated_quota


@router.get("/users/{user_id}/user-prompts")
def get_user_prompts_api(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Get all user prompts for a user.
    Internal endpoint for BFF use only.
    """
    prompts = user_prompt_service.get_user_prompt(db, user_id)
    return prompts if prompts else []


@router.post("/user-prompts")
def create_user_prompt_api(
    prompt_data: dict,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Create a new user prompt.
    Internal endpoint for BFF use only.

    Expected payload:
    {
        "user_id": "uuid",
        "prompt_text": "string"
    }
    """
    from backendApp.services.user_prompt_service import UserPromptService
    from backendApp.schemas.user_prompt_schemas import UserPromptCreate

    user_prompt_service = UserPromptService()
    prompt = UserPromptCreate(**prompt_data)
    db_prompt = user_prompt_service.create_user_prompt(db, prompt)
    if not db_prompt:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user prompt"
        )
    return db_prompt


@router.delete("/user-prompts/{prompt_id}")
def delete_user_prompt_api(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Delete a user prompt.
    Internal endpoint for BFF use only.
    """
    from backendApp.services.user_prompt_service import UserPromptService
    user_prompt_service = UserPromptService()
    success = user_prompt_service.delete_user_prompt(db, prompt_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User prompt not found"
        )
    return {"message": "User prompt deleted successfully"}


@router.get("/system-prompts")
def get_system_prompts_api(
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """
    Get all system prompts.
    Internal endpoint for BFF use only.
    """
    from backendApp.services.system_prompt_service import SystemPromptService
    system_prompt_service = SystemPromptService()
    prompts = system_prompt_service.get_all_system_prompt(db)
    return prompts if prompts else []
