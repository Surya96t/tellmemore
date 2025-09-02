# --- File: backendApp/schemas/addon_prompt_schemas.py ---
# This file defines Pydantic schemas for Aaddon prompts related data.

from pydantic import BaseModel, Field
from typing import Optional
import uuid

class AddonPromptBase(BaseModel):  
    prompt_text: str

class SystemPromptCreate(AddonPromptBase):
    pass

class SystemPrompt(AddonPromptBase):
    prompt_id: uuid.UUID
    
    class Config:
        orm_mode = True

class SystemPromptUpdate(BaseModel):   
    prompt_text: Optional[str] = None


class UserPromptCreate(AddonPromptBase):
    pass

class UserPrompt(AddonPromptBase):
    prompt_id: uuid.UUID
    
    class Config:
        orm_mode = True

class UserPromptUpdate(BaseModel):   
    prompt_text: Optional[str] = None