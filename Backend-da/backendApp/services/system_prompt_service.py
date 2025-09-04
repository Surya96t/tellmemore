# --- File: backendApp/services/system_prompt_service.py ---
# This file now only contains the business logic for System Prompt operations.

from sqlalchemy.orm import Session
from backendApp.models.postgres_models import SystemPrompt
from backendApp.schemas.system_prompt_schemas import  SystemPromptCreate, SystemPromptBase
import uuid

class SystemPromptService:
    def create_system_prompt(self, db: Session, prompt: SystemPromptCreate):              
        db_prompt = SystemPrompt(**prompt.dict())
        db.add(db_prompt)
        db.commit()
        db.refresh(db_prompt)
        return db_prompt

    def get_all_system_prompt(self, db: Session):
        return db.query(SystemPrompt).all()
    

    def update_system_prompt(self, db: Session, prompt_id: uuid.UUID, prompt_update: SystemPromptBase):
        prompt = self.get_system_prompt(db, prompt_id)
        if prompt:
            for key, value in prompt_update.dict(exclude_unset=True).items():
                setattr(prompt, key, value)
            db.commit()
            db.refresh(prompt)
        return prompt

    def delete_system_prompt(self, db: Session, prompt_id: uuid.UUID):
        prompt = self.get_system_prompt(db, prompt_id)
        if prompt:
            db.delete(prompt)
            db.commit()
            return True
        return False