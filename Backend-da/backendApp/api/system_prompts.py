# --- File: backendApp/api/system_prompts.py ---
# This file defines API endpoints for System Prompt resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.system_prompt_schemas import SystemPromptBase, SystemPromptCreate,  SystemPromptResponse
from backendApp.services.system_prompt_service import SystemPromptService
from backendApp.dependencies import get_db # Import get_db from dependencies

import uuid
from typing import List

router = APIRouter()
prompt_service = SystemPromptService()

@router.post("", response_model=SystemPromptResponse, status_code=status.HTTP_201_CREATED)
def create_system_prompt_api(prompt: SystemPromptCreate, db: Session = Depends(get_db)):
    db_prompt = prompt_service.create_system_prompt(db, prompt)
    if not db_prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User or Chat Session not found for this prompt")
    return db_prompt

# Add this new GET endpoint to retrieve all system prompts
@router.get("", response_model=List[SystemPromptResponse])
def get_all_system_prompts_api(db: Session = Depends(get_db)):
    return prompt_service.get_all_system_prompt(db)


@router.put("/{prompt_id}", response_model=SystemPromptResponse)
def update_system_prompt_api(prompt_id: uuid.UUID, prompt_update: SystemPromptBase, db: Session = Depends(get_db)):
    prompt = prompt_service.update_system_prompt(db, prompt_id, prompt_update)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt

@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_system_prompt_api(prompt_id: uuid.UUID, db: Session = Depends(get_db)):
    if not prompt_service.delete_system_prompt(db, prompt_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return {"message": "Prompt deleted successfully"}