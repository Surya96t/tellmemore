# TellMeMore/dataAccess/services/prompt_service.py
from dataAccess.models.mongo_models import Prompt
from datetime import datetime

class PromptService:
    @staticmethod
    def create_prompt(chat_session_id, user_id, prompt_text, response_text): # UPDATED: parameter
        new_prompt = Prompt(
            chat_session_id=chat_session_id, # UPDATED
            user_id=user_id,
            prompt_text=prompt_text,
            response_text=response_text,
            timestamp=datetime.utcnow()
        )
        new_prompt.save()
        return new_prompt

    @staticmethod
    def get_prompt_by_id(prompt_id):
        try:
            return Prompt.objects.get(id=prompt_id)
        except Prompt.DoesNotExist:
            return None

    @staticmethod
    def get_prompts_for_chat_session(chat_session_id): # RENAMED: Method name and parameter
        return Prompt.objects(chat_session_id=chat_session_id).order_by('timestamp').all() # UPDATED

    @staticmethod
    def get_prompts_for_user(user_id):
        return Prompt.objects(user_id=user_id).order_by('timestamp').all()

    @staticmethod
    def update_prompt(prompt_id, **kwargs):
        prompt = PromptService.get_prompt_by_id(prompt_id)
        if not prompt:
            return None
        for key, value in kwargs.items():
            if hasattr(prompt, key):
                setattr(prompt, key, value)
        prompt.save()
        return prompt

    @staticmethod
    def delete_prompt(prompt_id):
        prompt = PromptService.get_prompt_by_id(prompt_id)
        if prompt:
            prompt.delete()
            return True
        return False