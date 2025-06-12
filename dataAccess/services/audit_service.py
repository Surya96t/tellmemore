# TellMeMore/dataAccess/services/audit_service.py
from dataAccess.models.mongo_models import AuditLog
from datetime import datetime

class AuditService:
    @staticmethod
    def log_event(event_type, user_id=None, chat_session_id=None, details=None): # UPDATED: parameter
        if details is None:
            details = {}
        new_log = AuditLog(
            event_type=event_type,
            user_id=user_id,
            chat_session_id=chat_session_id, # UPDATED
            timestamp=datetime.utcnow(),
            details=details
        )
        new_log.save()
        return new_log

    @staticmethod
    def get_audit_logs(event_type=None, user_id=None, chat_session_id=None, limit=100): # UPDATED: parameter
        query = {}
        if event_type:
            query['event_type'] = event_type
        if user_id:
            query['user_id'] = user_id
        if chat_session_id: # UPDATED
            query['chat_session_id'] = chat_session_id
        return AuditLog.objects(**query).order_by('-timestamp').limit(limit).all()