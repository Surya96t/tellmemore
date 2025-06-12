# TellMeMore/dataAccess/services/user_service.py
from dataAccess import db
from dataAccess.models.postgres_models import User, Quota
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class UserService:
    @staticmethod
    def create_user(name, email, password, role='user'):
        hashed_password = generate_password_hash(password)
        new_user = User(name=name, email=email, password_hash=hashed_password, role=role)
        db.session.add(new_user)
        # Also create a default quota for the new user
        new_quota = Quota(user=new_user) # Link quota to user
        db.session.add(new_quota)
        db.session.commit()
        return new_user

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user.password_hash, password)

    @staticmethod
    def update_user(user_id, **kwargs):
        user = User.query.get(user_id)
        if not user:
            return None
        for key, value in kwargs.items():
            if hasattr(user, key):
                if key == 'password': # Handle password hashing if updating
                    user.password_hash = generate_password_hash(value)
                else:
                    setattr(user, key, value)
        db.session.commit()
        return user

    @staticmethod
    def delete_user(user_id):
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return True
        return False