# TellMeMore/dataAccess/models/postgres_models.py
from dataAccess import db
from datetime import datetime
import uuid

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='user', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    quotas = db.relationship('Quota', backref='user', uselist=False, lazy=True, cascade="all, delete-orphan")
    # UPDATED: 'Session' to 'ChatSession' and 'sessions' to 'chat_sessions'
    chat_sessions = db.relationship('ChatSession', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.email}>'

class Quota(db.Model):
    __tablename__ = 'quotas'
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), primary_key=True)
    daily_limit = db.Column(db.Integer, default=100, nullable=False)
    used_today = db.Column(db.Integer, default=0, nullable=False)
    last_reset = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<Quota for User {self.user_id}>'

# RENAMED: Session to ChatSession
class ChatSession(db.Model):
    __tablename__ = 'chat_sessions' # UPDATED: Table name
    chat_session_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # UPDATED: Column name
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<ChatSession {self.chat_session_id}>'