# TellMeMore/dataAccess/services/chat_session_service.py
from dataAccess import db
from dataAccess.models.postgres_models import ChatSession # UPDATED: Import ChatSession
from datetime import datetime

class ChatSessionService: # RENAMED: Class name
    @staticmethod
    def create_chat_session(user_id, title): # RENAMED: Method name
        new_chat_session = ChatSession(user_id=user_id, title=title) # UPDATED: Model name
        db.session.add(new_chat_session)
        db.session.commit()
        return new_chat_session

    @staticmethod
    def get_chat_session_by_id(chat_session_id): # RENAMED: Method name and parameter
        return ChatSession.query.get(chat_session_id) # UPDATED: Model name

    @staticmethod
    def get_chat_sessions_for_user(user_id): # RENAMED: Method name
        return ChatSession.query.filter_by(user_id=user_id).order_by(ChatSession.created_at.desc()).all() # UPDATED: Model name

    @staticmethod
    def update_chat_session(chat_session_id, **kwargs): # RENAMED: Method name and parameter
        chat_session = ChatSession.query.get(chat_session_id) # UPDATED: Model name
        if not chat_session:
            return None
        for key, value in kwargs.items():
            if hasattr(chat_session, key):
                setattr(chat_session, key, value)
        db.session.commit()
        return chat_session

    @staticmethod
    def delete_chat_session(chat_session_id): # RENAMED: Method name and parameter
        chat_session = ChatSession.query.get(chat_session_id) # UPDATED: Model name
        if chat_session:
            db.session.delete(chat_session)
            db.session.commit()
            return True
        return False