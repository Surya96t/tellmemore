# TellMeMore/dataAccess/services/quota_service.py
from dataAccess import db
from dataAccess.models.postgres_models import Quota
from datetime import datetime, timedelta

class QuotaService:
    @staticmethod
    def get_user_quota(user_id):
        quota = Quota.query.get(user_id)
        # Check if daily_limit needs to be reset
        if quota and (datetime.utcnow() - quota.last_reset).days >= 1:
            quota.used_today = 0
            quota.last_reset = datetime.utcnow()
            db.session.commit()
        return quota

    @staticmethod
    def increment_quota_usage(user_id, amount=1):
        quota = QuotaService.get_user_quota(user_id) # Ensures reset if needed
        if not quota:
            return False # Quota record not found, should not happen if created with user

        if quota.used_today + amount > quota.daily_limit:
            return False # Exceeds daily limit

        quota.used_today += amount
        db.session.commit()
        return True

    @staticmethod
    def set_daily_limit(user_id, new_limit):
        quota = Quota.query.get(user_id)
        if quota:
            quota.daily_limit = new_limit
            db.session.commit()
            return True
        return False