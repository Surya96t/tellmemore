# --- File: backendApp/schemas/system_prompt_schemas.py ---
# This file defines Pydantic schemas for System Prompt related data.

from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid

class SystemPromptBase(BaseModel):
    prompt_text: str    

class SystemPromptCreate(SystemPromptBase):
    pass

class SystemPromptUpdate(BaseModel):
    prompt_text: Optional[str] = None

class SystemPromptResponse(SystemPromptBase):
    prompt_id: uuid.UUID    

    model_config = ConfigDict(from_attributes=True)