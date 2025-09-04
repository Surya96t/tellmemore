# --- File: backendApp/schemas/user_prompt_schemas.py ---
# This file defines Pydantic schemas for user prompts related data.

from pydantic import BaseModel,ConfigDict
from typing import Optional
import uuid

class UserPromptBase(BaseModel):  
    prompt_text: str

class UserPromptCreate(UserPromptBase):
    user_id: uuid.UUID

class UserPromptUpdate(BaseModel):   
    prompt_text: Optional[str] = None

class UserPromptResponse(UserPromptBase):
    prompt_id: uuid.UUID
    user_id: uuid.UUID    

    model_config = ConfigDict(from_attributes=True)