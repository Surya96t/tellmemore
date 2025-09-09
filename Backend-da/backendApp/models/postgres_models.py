# --- File: backendApp/models/postgres_models.py ---
# This file defines your SQLAlchemy ORM models.

from sqlalchemy import Column, String, Integer, DateTime, Text, ARRAY, JSON , ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid
from sqlalchemy import Column, String,  Text
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    # Add this relationship to link to UserPrompt
    user_prompts = relationship("UserPrompt", back_populates="user", cascade="all, delete-orphan")

class Quota(Base):
    __tablename__ = "quotas"
    user_id = Column(UUID(as_uuid=True), primary_key=True)
    daily_limit = Column(Integer, default=10000, nullable=False)
    used_today = Column(Integer, default=0, nullable=False)
    last_reset = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class Prompt(Base):
    __tablename__ = "prompts"
    prompt_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    session_id = Column(UUID(as_uuid=True), nullable=False)
    prompt_text = Column(Text, nullable=False)
    llm_responses = Column(ARRAY(Text), default=[], nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    action = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class SystemPrompt(Base):
    __tablename__ = "system_prompts"
    prompt_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)    
    prompt_text = Column(Text, nullable=False)

# Corrected UserPrompt model from backendApp/models/postgres_models.py

class UserPrompt(Base):
    __tablename__ = "user_prompts"
    prompt_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # The ForeignKey links this column to the 'user_id' in the 'users' table
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)    
    prompt_text = Column(Text, nullable=False)

    # The 'relationship' links this model back to the User model,
    # with a back-population reference
    user = relationship("User", back_populates="user_prompts")