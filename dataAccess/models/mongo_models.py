# TellMeMore/dataAccess/models/mongo_models.py
from dataAccess import mongo
from datetime import datetime

class Prompt(mongo.Document):
    # UPDATED: session_id to chat_session_id
    chat_session_id = mongo.StringField(required=True) # Link to PostgreSQL chat session
    user_id = mongo.StringField(required=True)        # Link to PostgreSQL user
    prompt_text = mongo.StringField(required=True)
    response_text = mongo.StringField()
    timestamp = mongo.DateTimeField(default=datetime.utcnow, required=True)

    meta = {'collection': 'prompts'}

    def to_dict(self):
        return {
            'id': str(self.id),
            'chat_session_id': self.chat_session_id, # UPDATED
            'user_id': self.user_id,
            'prompt_text': self.prompt_text,
            'response_text': self.response_text,
            'timestamp': self.timestamp.isoformat()
        }

class AuditLog(mongo.Document):
    event_type = mongo.StringField(required=True)
    user_id = mongo.StringField()
    # UPDATED: session_id to chat_session_id (optional, for chat_session-specific events)
    chat_session_id = mongo.StringField()
    timestamp = mongo.DateTimeField(default=datetime.utcnow, required=True)
    details = mongo.DictField()

    meta = {'collection': 'audit_logs'}

    def to_dict(self):
        return {
            'id': str(self.id),
            'event_type': self.event_type,
            'user_id': self.user_id,
            'chat_session_id': self.chat_session_id, # UPDATED
            'timestamp': self.timestamp.isoformat(),
            'details': self.details
        }