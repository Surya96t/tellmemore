# --- File: backendApp/api/prompts.py ---
# This file defines API endpoints for Prompt resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.prompt_schemas import PromptCreate, PromptBase, PromptResponse
from backendApp.schemas.addon_prompt_schemas import SystemPromptCreate, SystemPrompt, UserPromptCreate, UserPrompt
from backendApp.services.prompt_service import PromptService
from backendApp.dependencies import get_db

import uuid
from typing import List

router = APIRouter()
prompt_service = PromptService()

@router.post("/", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt_api(prompt: PromptCreate, db: Session = Depends(get_db)):
    db_prompt = prompt_service.create_prompt(db, prompt)
    if not db_prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User or Chat Session not found for this prompt")
    return db_prompt

@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt_api(prompt_id: uuid.UUID, db: Session = Depends(get_db)):
    prompt = prompt_service.get_prompt(db, prompt_id)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt

@router.get("/session/{session_id}", response_model=List[PromptResponse])
def get_session_prompts_api(session_id: uuid.UUID, db: Session = Depends(get_db)):
    prompts = prompt_service.get_session_prompts(db, session_id)
    return prompts

@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt_api(prompt_id: uuid.UUID, prompt_update: PromptBase, db: Session = Depends(get_db)):
    prompt = prompt_service.update_prompt(db, prompt_id, prompt_update)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt

@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt_api(prompt_id: uuid.UUID, db: Session = Depends(get_db)):
    if not prompt_service.delete_prompt(db, prompt_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return {"message": "Prompt deleted successfully"}

# --- New routes for addon prompts below ---

@router.post("/system", response_model=SystemPrompt)
def create_system_prompt_api(
    prompt_data: SystemPromptCreate, db: Session = Depends(get_db)
):
    """Create a new system prompt."""
    return prompt_service.create_system_prompt(db, prompt_data=prompt_data)

@router.get("/system", response_model=List[SystemPrompt])
def get_all_system_prompts_api(db: Session = Depends(get_db)):
    """Retrieve all system prompts."""
    return prompt_service.get_all_system_prompts(db)

@router.post("/user/{user_id}", response_model=UserPrompt)
def create_user_prompt_api(
    user_id: uuid.UUID,
    prompt_data: UserPromptCreate,
    db: Session = Depends(get_db)
):
    """Create a new user prompt."""
    return prompt_service.create_user_prompt(db, user_id=user_id, prompt_data=prompt_data)

@router.get("/user/{user_id}", response_model=List[UserPrompt])
def get_user_prompts_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    """Retrieve all prompts for a specific user."""
    return prompt_service.get_user_prompts_by_user(db, user_id=user_id)