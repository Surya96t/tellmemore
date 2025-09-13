# --- File: backendApp/api/user_prompts.py ---
# This file defines API endpoints for Prompt resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.user_prompt_schemas import UserPromptBase,  UserPromptCreate, UserPromptResponse
from backendApp.services.user_prompt_service import UserPromptService
from backendApp.dependencies import get_db # Import get_db from dependencies

import uuid
from typing import List

router = APIRouter()
prompt_service = UserPromptService()

@router.post("/", response_model=UserPromptResponse, status_code=status.HTTP_201_CREATED)
def create_user_prompt_api(prompt: UserPromptCreate, db: Session = Depends(get_db)):
    db_prompt = prompt_service.create_user_prompt(db, prompt)    
    return db_prompt

# Correct the response_model to expect a list of UserPromptResponse objects
@router.get("/user/{user_id}", response_model=List[UserPromptResponse])
def get_user_prompt_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    prompts = prompt_service.get_user_prompt(db, user_id)
    # Return empty list if no prompts found instead of 404 error
    return prompts or []

@router.put("/{prompt_id}", response_model=UserPromptResponse)
def update_prompt_api(prompt_id: uuid.UUID, prompt_update: UserPromptBase, db: Session = Depends(get_db)):
    prompt = prompt_service.update_user_prompt(db, prompt_id, prompt_update)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt

@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt_api(prompt_id: uuid.UUID, db: Session = Depends(get_db)):
    if not prompt_service.delete_user_prompt(db, prompt_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return {"message": "Prompt deleted successfully"}