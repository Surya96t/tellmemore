# --- File: backendApp/services/prompt_service.py ---
# This file contains the business logic for Prompt operations.

from sqlalchemy.orm import Session
from backendApp.models.postgres_models import UserPrompt, User
from backendApp.schemas.user_prompt_schemas import UserPromptCreate, UserPromptBase
import uuid

class UserPromptService:
    def create_user_prompt(self, db: Session, prompt: UserPromptCreate):
        # Ensure user and session exist
        user = db.query(User).filter(User.user_id == prompt.user_id).first()        
        if not user :
            return None # Or raise a specific error
        db_prompt = UserPrompt(**prompt.dict())
        db.add(db_prompt)
        db.commit()
        db.refresh(db_prompt)
        return db_prompt

    def get_user_prompt(self, db: Session, user_id: uuid.UUID):
        return db.query(UserPrompt).filter(UserPrompt.user_id == user_id).all()

    def update_user_prompt(self, db: Session, prompt_id: uuid.UUID, prompt_update: UserPromptBase):
        prompt = self.get_user_prompt(db, prompt_id)
        if prompt:
            for key, value in prompt_update.dict(exclude_unset=True).items():
                setattr(prompt, key, value)
            db.commit()
            db.refresh(prompt)
        return prompt

    def delete_user_prompt(self, db: Session, prompt_id: uuid.UUID):
        prompt = self.get_user_prompt(db, prompt_id)
        if prompt:
            db.delete(prompt)
            db.commit()
            return True
        return False