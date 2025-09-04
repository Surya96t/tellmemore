# --- File: backendApp/api/addon_prompts.py ---
# This file defines API endpoints for addon prompt resources (SystemPrompts and UserPrompts).

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.addon_prompt_schemas import SystemPromptCreate, SystemPrompt, UserPromptCreate, UserPrompt, SystemPromptUpdate, UserPromptUpdate
from backendApp.services.addon_prompt_service import AddonPromptService
from backendApp.dependencies import get_db
import uuid
from typing import List

router = APIRouter(tags=["Addon Prompts"])
addon_prompt_service = AddonPromptService()

# --- Routes for System Prompts ---
@router.post("/system", response_model=SystemPrompt, status_code=status.HTTP_201_CREATED)
def create_system_prompt_api(
    prompt_data: SystemPromptCreate,
    db: Session = Depends(get_db),
    
):
    """Create a new system prompt."""
    return addon_prompt_service.create_system_prompt(db, prompt_data=prompt_data)

@router.get("/system", response_model=List[SystemPrompt])
def get_all_system_prompts_api(
    db: Session = Depends(get_db),
    
):
    """Retrieve all system prompts."""
    return addon_prompt_service.get_all_system_prompts(db)

@router.get("/system/{prompt_id}", response_model=SystemPrompt)
def get_system_prompt_api(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    
):
    """Retrieve a single system prompt by its ID."""
    prompt = addon_prompt_service.get_system_prompt_by_id(db, prompt_id)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompt not found"
        )
    return prompt

@router.put("/system/{prompt_id}", response_model=SystemPrompt)
def update_system_prompt_api(
    prompt_id: uuid.UUID,
    prompt_data: SystemPromptUpdate,
    db: Session = Depends(get_db),
    
):
    """Update an existing system prompt."""
    prompt = addon_prompt_service.update_system_prompt(db, prompt_id, prompt_data)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompt not found"
        )
    return prompt

@router.delete("/system/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_system_prompt_api(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    
):
    """Delete a system prompt by its ID."""
    if not addon_prompt_service.delete_system_prompt(db, prompt_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompt not found"
        )
    return {"message": "System prompt deleted successfully"}

# --- Routes for User Prompts ---
@router.post("/user", response_model=UserPrompt, status_code=status.HTTP_201_CREATED)
def create_user_prompt_api(
    prompt_data: UserPromptCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new user prompt."""
    user_id = uuid.UUID(current_user["user_id"])
    return addon_prompt_service.create_user_prompt(db, user_id, prompt_data)

@router.get("/user", response_model=List[UserPrompt])
def get_all_user_prompts_api(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all user prompts for the current user."""
    user_id = uuid.UUID(current_user["user_id"])
    return addon_prompt_service.get_user_prompts_by_user(db, user_id)

@router.get("/user/{prompt_id}", response_model=UserPrompt)
def get_user_prompt_api(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve a single user prompt by its ID."""
    prompt = addon_prompt_service.get_user_prompt_by_id(db, prompt_id)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User prompt not found"
        )
    return prompt

@router.put("/user/{prompt_id}", response_model=UserPrompt)
def update_user_prompt_api(
    prompt_id: uuid.UUID,
    prompt_data: UserPromptUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a user prompt."""
    prompt = addon_prompt_service.update_user_prompt(db, prompt_id, prompt_data)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User prompt not found"
        )
    return prompt

@router.delete("/user/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_prompt_api(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a user prompt by its ID."""
    if not addon_prompt_service.delete_user_prompt(db, prompt_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User prompt not found"
        )
    return {"message": "User prompt deleted successfully"}