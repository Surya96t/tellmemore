
                         ***********************************************
                         ***********************************************
                         *****         TELLMEMORE PROJECT          *****
                         *****             Code book               *****
                         ***********************************************
                         ***********************************************



TellMeMore/
│
├── Backend-da/
│   └── backendApp/
│       ├── api/
│       │   ├── __init__.py
│       │   ├── audit_logs.py
│       │   ├── auth.py
│       │   ├── chat_sessions.py
│       │   ├── prompts.py
│       │   └── users.py
│       │
│       ├── models/
│       │   ├── __init__.py
│       │   └── postgres_models.py
│       │
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── audit_log_schemas.py
│       │   ├── auth_schemas.py
│       │   ├── chat_session_schemas.py
│       │   ├── prompt_schemas.py
│       │   ├── quota_schemas.py
│       │   └── user_schemas.py
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── audit_service.py
│       │   ├── auth_service.py
│       │   ├── chat_session_service.py
│       │   ├── prompt_service.py
│       │   ├── quota_service.py
│       │   └── user_service.py
│       │
│       ├── utils/
│       │   ├── __init__.py
│       │   └── dependencies.py
│       │
│       ├── app.py
│       ├── app_structure.txt
│       ├── LICENSE
│       ├── readme.md
│       └── requirements.txt
│
├── Backend-llm/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── helper_functions.py
│   │   ├── langchain_model_chains.py
│   │   ├── main.py
│   │   ├── pydantic_models.py
│   │   └── tbd.py
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_pydantic_models.py
│   │
│   ├── llm_responses.py
│   ├── simulation_of_pydantic_models.ipynb
│   ├── LICENSE
│   ├── README.md
│   └── requirements.txt
│
├── Frontend-ui/
│   └── frontend_app/
│       ├── static/
│       │   └── logo.jpg
│       │
│       ├── templates/
│       │   ├── auth.html
│       │   ├── base.html
│       │   ├── dashboard.html
│       │   └── __init__.py
│       │
│       ├── app.py
│       ├── config.py
│       ├── LICENSE
│       ├── readme.md
│       ├── requirements.txt
│       └── routes.py
│
├── .gitignore
└── LICENSE


--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\app.py ---
# TELLMEMORE_BACKEND/app.py (Backend API Only)
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from backendApp.models.postgres_models import Base
from backendApp.dependencies import engine
from backendApp.api.users import router as users_router
from backendApp.api.chat_sessions import router as chat_sessions_router
from backendApp.api.prompts import router as prompts_router
from backendApp.api.audit_logs import router as audit_logs_router
from backendApp.api.auth import router as auth_router # Import the auth router

# --- Lifespan Context Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events for the application.
    Creates database tables on startup.
    """
    port = os.getenv("PORT", "8000")
    print(f"Backend Application startup on port {port} (from environment variable/default)...")
    Base.metadata.create_all(bind=engine) # Create database tables
    print("Database tables created/checked.")
    yield
    print("Backend Application shutdown.")

# --- FastAPI Application ---
app = FastAPI(
    title="LLM Interaction API",
    description="API for managing users, chat sessions, prompts, quotas, and audit logs for an LLM application.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/v1/docs", # API documentation URL
    redoc_url="/api/v1/redoc" # Redoc documentation URL
)

# --- CORS Configuration ---
# Get allowed origins from environment variable, split by comma
# This should include the URL of your separate frontend application (e.g., http://localhost:8080)
origins = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Allows specific origins
    allow_credentials=True, # Allow cookies to be included in cross-origin HTTP requests
    allow_methods=["*"],    # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Allow all headers
)

# --- Main API Router for /api/v1 prefix ---
api_v1_router = APIRouter(prefix="/api/v1")

# --- Include API Routers within the api_v1_router ---
# All API endpoints will be prefixed with /api/v1
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"]) # Auth endpoints like /api/v1/auth/login
api_v1_router.include_router(users_router, prefix="/users", tags=["Users"])
api_v1_router.include_router(chat_sessions_router, prefix="/chat_sessions", tags=["Chat Sessions"])
api_v1_router.include_router(prompts_router, prefix="/prompts", tags=["Prompts"])
api_v1_router.include_router(audit_logs_router, prefix="/audit_logs", tags=["Audit Logs"])

# Include the main api_v1_router in the FastAPI app
app.include_router(api_v1_router)
print("api_v1_router has been included in the main app.")

# Root endpoint for basic backend API check (not serving frontend HTML)
@app.get("/")
def read_root():
    host = os.getenv("HOST", "127.0.0.1")
    port = os.getenv("PORT", "8000")
    base_api_url = f"http://{host}:{port}/api/v1"
    return {"message": f"Welcome to the LLM Interaction API! Access documentation at {base_api_url}/docs"}

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\app.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\dependencies.py ---
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager
import os
from dotenv import load_dotenv # Import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Configuration
# Added 'options=project%3Dep-square-unit-a8cybfqv' to explicitly set the project slug for Neon.tech pooler.
DATABASE_URL="postgresql://neondb_owner:npg_37ogzmSbAFwj@ep-square-unit-a8cybfqv-pooler.eastus2.azure.neon.tech:5432/neondb?sslmode=require"

# SQLAlchemy Engine
engine = create_engine(DATABASE_URL)

# SessionLocal for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base for SQLAlchemy declarative models
Base = declarative_base()

# Dependency to get DB session
@contextmanager
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency for FastAPI endpoints
def get_db():
    with get_db_session() as db:
        yield db

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\dependencies.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\__init__.py ---
# --- File: backendApp/__init__.py ---
# This file makes the 'backendApp' directory a Python package.
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\audit_logs.py ---
# --- File: backendApp/api/audit_logs.py ---
# This file defines API endpoints for Audit Log resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.audit_log_schemas import AuditLogCreate, AuditLogResponse
from backendApp.services.audit_service import AuditService
from backendApp.dependencies import get_db # Import get_db from dependencies

import uuid
from typing import List

router = APIRouter()
audit_service = AuditService()

@router.post("/", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
def create_audit_log_api(audit_log: AuditLogCreate, db: Session = Depends(get_db)):
    db_audit_log = audit_service.create_audit_log(db, audit_log)
    if not db_audit_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found for this audit log")
    return db_audit_log

@router.get("/{log_id}", response_model=AuditLogResponse)
def get_audit_log_api(log_id: uuid.UUID, db: Session = Depends(get_db)):
    audit_log = audit_service.get_audit_log(db, log_id)
    if not audit_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log not found")
    return audit_log

@router.get("/user/{user_id}", response_model=List[AuditLogResponse])
def get_user_audit_logs_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    audit_logs = audit_service.get_user_audit_logs(db, user_id)
    return audit_logs
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\audit_logs.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\auth.py ---
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from backendApp.schemas.user_schemas import UserCreate, UserResponse
from backendApp.schemas.auth_schemas import Token, LoginRequest, TokenData
from backendApp.services.auth_service import AuthService
from backendApp.dependencies import get_db
from backendApp.models.postgres_models import User

router = APIRouter()
auth_service = AuthService()

# OAuth2PasswordBearer for token extraction from headers
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Dependency to get the current authenticated user from a JWT token.
    Raises HTTPException if token is invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        user = auth_service.get_user_from_token(db, token)
        if user is None:
            raise credentials_exception
        return user
    except Exception as e:
        # Catch any other exceptions during token decoding/user retrieval
        raise credentials_exception from e


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_create: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user in the system.
    """
    db_user = auth_service.create_user(db, user_create)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return db_user

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticates a user and returns an access token.
    Uses OAuth2PasswordRequestForm for standard username/password login.
    """
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Define token expiration time (e.g., 30 minutes)
    access_token_expires = timedelta(minutes=auth_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/protected", response_model=UserResponse)
def read_protected_data(current_user: User = Depends(get_current_user)):
    """
    An example protected endpoint that requires a valid JWT token.
    Returns the current authenticated user's details.
    """
    return current_user

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\auth.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\chat_sessions.py ---
# --- File: backendApp/api/chat_sessions.py ---
# This file defines API endpoints for Chat Session resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.chat_session_schemas import ChatSessionCreate, ChatSessionBase, ChatSessionResponse
from backendApp.services.chat_session_service import ChatSessionService
from backendApp.dependencies import get_db # Import get_db from dependencies

import uuid
from typing import List

router = APIRouter()
chat_session_service = ChatSessionService()

@router.post("/", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
def create_chat_session_api(session: ChatSessionCreate, db: Session = Depends(get_db)):
    db_session = chat_session_service.create_chat_session(db, session)
    if not db_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found for this session")
    return db_session

@router.get("/{session_id}", response_model=ChatSessionResponse)
def get_chat_session_api(session_id: uuid.UUID, db: Session = Depends(get_db)):
    session = chat_session_service.get_chat_session(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    return session

@router.get("/user/{user_id}", response_model=List[ChatSessionResponse])
def get_user_chat_sessions_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    sessions = chat_session_service.get_user_chat_sessions(db, user_id)
    return sessions

@router.put("/{session_id}", response_model=ChatSessionResponse)
def update_chat_session_api(session_id: uuid.UUID, session_update: ChatSessionBase, db: Session = Depends(get_db)):
    session = chat_session_service.update_chat_session(db, session_id, session_update)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    return session

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session_api(session_id: uuid.UUID, db: Session = Depends(get_db)):
    if not chat_session_service.delete_chat_session(db, session_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    return {"message": "Chat session deleted successfully"}
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\chat_sessions.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\prompts.py ---
# --- File: backendApp/api/prompts.py ---
# This file defines API endpoints for Prompt resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.prompt_schemas import PromptCreate, PromptBase, PromptResponse
from backendApp.services.prompt_service import PromptService
from backendApp.dependencies import get_db # Import get_db from dependencies

import uuid
from typing import List

router = APIRouter()
prompt_service = PromptService()

@router.post("/", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt_api(prompt: PromptCreate, db: Session = Depends(get_db)):
    db_prompt = prompt_service.create_prompt(db, prompt)
    if not db_prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User or Chat Session not found for this prompt")
    return db_prompt

@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt_api(prompt_id: uuid.UUID, db: Session = Depends(get_db)):
    prompt = prompt_service.get_prompt(db, prompt_id)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt

@router.get("/session/{session_id}", response_model=List[PromptResponse])
def get_session_prompts_api(session_id: uuid.UUID, db: Session = Depends(get_db)):
    prompts = prompt_service.get_session_prompts(db, session_id)
    return prompts

@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt_api(prompt_id: uuid.UUID, prompt_update: PromptBase, db: Session = Depends(get_db)):
    prompt = prompt_service.update_prompt(db, prompt_id, prompt_update)
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt

@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt_api(prompt_id: uuid.UUID, db: Session = Depends(get_db)):
    if not prompt_service.delete_prompt(db, prompt_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return {"message": "Prompt deleted successfully"}
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\prompts.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\users.py ---
# --- File: backendApp/api/users.py ---
# This file defines API endpoints for User and Quota resources.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backendApp.schemas.user_schemas import UserCreate, UserBase, UserResponse
from backendApp.schemas.quota_schemas import QuotaBase, QuotaResponse
from backendApp.services.user_service import UserService
from backendApp.services.quota_service import QuotaService
from backendApp.dependencies import get_db # Import get_db from dependencies

import uuid

router = APIRouter()
user_service = UserService()
quota_service = QuotaService()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_api(user: UserCreate, db: Session = Depends(get_db)):
    db_user = user_service.create_user(db, user)
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user_api(user_id: uuid.UUID, user_update: UserBase, db: Session = Depends(get_db)):
    user = user_service.update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    if not user_service.delete_user(db, user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User deleted successfully"}

@router.get("/{user_id}/quota", response_model=QuotaResponse)
def get_user_quota_api(user_id: uuid.UUID, db: Session = Depends(get_db)):
    quota = quota_service.get_user_quota(db, user_id)
    if not quota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quota not found for this user")
    return quota

@router.put("/{user_id}/quota", response_model=QuotaResponse)
def update_user_quota_api(user_id: uuid.UUID, quota_update: QuotaBase, db: Session = Depends(get_db)):
    quota = quota_service.update_user_quota(db, user_id, quota_update)
    if not quota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quota not found for this user")
    return quota
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\users.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\__init__.py ---
# --- File: backendApp/api/__init__.py ---
# This file makes the 'api' directory a Python package.
# It can also be used to export routers.

# from .users import router as users_router
# from .chat_sessions import router as chat_sessions_router
# from .prompts import router as prompts_router
# from .audit_logs import router as audit_logs_router

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\api\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\models\postgres_models.py ---
# --- File: backendApp/models/postgres_models.py ---
# This file defines your SQLAlchemy ORM models.

from sqlalchemy import Column, String, Integer, DateTime, Text, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class Quota(Base):
    __tablename__ = "quotas"
    user_id = Column(UUID(as_uuid=True), primary_key=True)
    daily_limit = Column(Integer, default=100, nullable=False)
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
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\models\postgres_models.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\models\__init__.py ---
# --- File: backendApp/models/__init__.py ---
# This file makes the 'models' directory a Python package.
# It can also be used to export common imports.

# from .postgres_models import Base, User, Quota, ChatSession, Prompt, AuditLog
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\models\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\audit_log_schemas.py ---
# --- File: backendApp/schemas/audit_log_schemas.py ---
# This file defines Pydantic schemas for Audit Log related data.

from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

class AuditLogBase(BaseModel):
    action: str
    details: Optional[Dict[str, Any]] = None

class AuditLogCreate(AuditLogBase):
    user_id: uuid.UUID

class AuditLogResponse(AuditLogBase):
    log_id: uuid.UUID
    user_id: uuid.UUID
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\audit_log_schemas.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\auth_schemas.py ---
# backendApp/schemas/auth_schemas.py 
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class LoginRequest(BaseModel):
    username: EmailStr # Using username for email in OAuth2PasswordRequestForm
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\auth_schemas.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\chat_session_schemas.py ---
# --- File: backendApp/schemas/chat_session_schemas.py ---
# This file defines Pydantic schemas for Chat Session related data.

from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    user_id: uuid.UUID

class ChatSessionResponse(ChatSessionBase):
    session_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\chat_session_schemas.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\prompt_schemas.py ---
# --- File: backendApp/schemas/prompt_schemas.py ---
# This file defines Pydantic schemas for Prompt related data.

from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime

class PromptBase(BaseModel):
    prompt_text: str
    llm_responses: Optional[List[str]] = []

class PromptCreate(PromptBase):
    user_id: uuid.UUID
    session_id: uuid.UUID

class PromptResponse(PromptBase):
    prompt_id: uuid.UUID
    user_id: uuid.UUID
    session_id: uuid.UUID
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\prompt_schemas.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\quota_schemas.py ---
# --- File: backendApp/schemas/quota_schemas.py ---
# This file defines Pydantic schemas for Quota related data.

from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

class QuotaBase(BaseModel):
    daily_limit: int = 100
    used_today: int = 0
    last_reset: Optional[datetime] = None

class QuotaResponse(QuotaBase):
    user_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\quota_schemas.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\user_schemas.py ---
# --- File: backendApp/schemas/user_schemas.py ---
# This file defines Pydantic schemas for User related data.

from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
import uuid
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "user"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    user_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\user_schemas.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\__init__.py ---
# --- File: backendApp/schemas/__init__.py ---
# This file makes the 'schemas' directory a Python package.
# It can also be used to export common schemas.

from .user_schemas import UserBase, UserCreate, UserResponse
from .quota_schemas import QuotaBase, QuotaResponse
from .chat_session_schemas import ChatSessionBase, ChatSessionCreate, ChatSessionResponse
from .prompt_schemas import PromptBase, PromptCreate, PromptResponse
from .audit_log_schemas import AuditLogBase, AuditLogCreate, AuditLogResponse
from .auth_schemas import LoginRequest, Token, TokenData

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\schemas\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\audit_service.py ---
# --- File: backendApp/services/audit_service.py ---
# This file contains the business logic for Audit Log operations.

from sqlalchemy.orm import Session
from backendApp.models.postgres_models import AuditLog, User
from backendApp.schemas.audit_log_schemas import AuditLogCreate
import uuid

class AuditService:
    def create_audit_log(self, db: Session, audit_log: AuditLogCreate):
        # Ensure user exists
        user = db.query(User).filter(User.user_id == audit_log.user_id).first()
        if not user:
            return None # Or raise a specific error
        db_audit_log = AuditLog(**audit_log.dict())
        db.add(db_audit_log)
        db.commit()
        db.refresh(db_audit_log)
        return db_audit_log

    def get_audit_log(self, db: Session, log_id: uuid.UUID):
        return db.query(AuditLog).filter(AuditLog.log_id == log_id).first()

    def get_user_audit_logs(self, db: Session, user_id: uuid.UUID):
        return db.query(AuditLog).filter(AuditLog.user_id == user_id).all()
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\audit_service.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\auth_service.py ---
# backendApp/services/auth_service.py (NEW FILE)
import os
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import HTTPException, status
from typing import Optional # Import Optional

from backendApp.models.postgres_models import User, Quota
from backendApp.schemas.user_schemas import UserCreate
from backendApp.schemas.auth_schemas import LoginRequest, TokenData

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
# IMPORTANT: Change this to a strong, random string in production!
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-that-should-be-changed")
ALGORITHM = "HS256"

class AuthService:
    # Moved ACCESS_TOKEN_EXPIRE_MINUTES inside the class as a class attribute
    ACCESS_TOKEN_EXPIRE_MINUTES = 30 # Token valid for 30 minutes

    def __init__(self):
        self.pwd_context = pwd_context
        # Ensure SECRET_KEY is set, otherwise raise an error
        if not SECRET_KEY or SECRET_KEY == "your-super-secret-key-that-should-be-changed":
            print("WARNING: SECRET_KEY is not set or is using the default value. Please set it in your .env file for production!")

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def create_user(self, db: Session, user: UserCreate):
        # Check if user with this email already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            return None # Indicate that user already exists

        hashed_password = self.get_password_hash(user.password)
        db_user = User(
            name=user.name,
            email=user.email,
            password_hash=hashed_password,
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Create a default quota for the new user
        db_quota = Quota(user_id=db_user.user_id)
        db.add(db_quota)
        db.commit()
        db.refresh(db_quota)
        return db_user

    def authenticate_user(self, db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user or not self.verify_password(password, user.password_hash):
            return None
        return user

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            # Use the class attribute ACCESS_TOKEN_EXPIRE_MINUTES
            expire = datetime.now(timezone.utc) + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def get_user_from_token(self, db: Session, token: str) -> User:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise JWTError("Invalid token payload")
            token_data = TokenData(email=email)
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            ) from e
        user = db.query(User).filter(User.email == token_data.email).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\auth_service.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\chat_session_service.py ---
# --- File: backendApp/services/chat_session_service.py ---
# This file contains the business logic for Chat Session operations.

from sqlalchemy.orm import Session
from backendApp.models.postgres_models import ChatSession, User
from backendApp.schemas.chat_session_schemas import ChatSessionCreate, ChatSessionBase
import uuid

class ChatSessionService:
    def create_chat_session(self, db: Session, session: ChatSessionCreate):
        # Ensure user exists before creating session
        user = db.query(User).filter(User.user_id == session.user_id).first()
        if not user:
            return None # Or raise a specific error to be handled by API layer
        db_session = ChatSession(**session.dict())
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        return db_session

    def get_chat_session(self, db: Session, session_id: uuid.UUID):
        return db.query(ChatSession).filter(ChatSession.session_id == session_id).first()

    def get_user_chat_sessions(self, db: Session, user_id: uuid.UUID):
        return db.query(ChatSession).filter(ChatSession.user_id == user_id).all()

    def update_chat_session(self, db: Session, session_id: uuid.UUID, session_update: ChatSessionBase):
        session = self.get_chat_session(db, session_id)
        if session:
            for key, value in session_update.dict(exclude_unset=True).items():
                setattr(session, key, value)
            db.commit()
            db.refresh(session)
        return session

    def delete_chat_session(self, db: Session, session_id: uuid.UUID):
        session = self.get_chat_session(db, session_id)
        if session:
            db.delete(session)
            db.commit()
            return True
        return False
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\chat_session_service.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\prompt_service.py ---
# --- File: backendApp/services/prompt_service.py ---
# This file contains the business logic for Prompt operations.

from sqlalchemy.orm import Session
from backendApp.models.postgres_models import Prompt, User, ChatSession
from backendApp.schemas.prompt_schemas import PromptCreate, PromptBase
import uuid

class PromptService:
    def create_prompt(self, db: Session, prompt: PromptCreate):
        # Ensure user and session exist
        user = db.query(User).filter(User.user_id == prompt.user_id).first()
        session = db.query(ChatSession).filter(ChatSession.session_id == prompt.session_id).first()
        if not user or not session:
            return None # Or raise a specific error
        db_prompt = Prompt(**prompt.dict())
        db.add(db_prompt)
        db.commit()
        db.refresh(db_prompt)
        return db_prompt

    def get_prompt(self, db: Session, prompt_id: uuid.UUID):
        return db.query(Prompt).filter(Prompt.prompt_id == prompt_id).first()

    def get_session_prompts(self, db: Session, session_id: uuid.UUID):
        return db.query(Prompt).filter(Prompt.session_id == session_id).all()

    def update_prompt(self, db: Session, prompt_id: uuid.UUID, prompt_update: PromptBase):
        prompt = self.get_prompt(db, prompt_id)
        if prompt:
            for key, value in prompt_update.dict(exclude_unset=True).items():
                setattr(prompt, key, value)
            db.commit()
            db.refresh(prompt)
        return prompt

    def delete_prompt(self, db: Session, prompt_id: uuid.UUID):
        prompt = self.get_prompt(db, prompt_id)
        if prompt:
            db.delete(prompt)
            db.commit()
            return True
        return False
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\prompt_service.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\quota_service.py ---
# --- File: backendApp/services/quota_service.py ---
# This file contains the business logic for Quota operations.

from sqlalchemy.orm import Session
from backendApp.models.postgres_models import Quota
from backendApp.schemas.quota_schemas import QuotaBase
import uuid

class QuotaService:
    def get_user_quota(self, db: Session, user_id: uuid.UUID):
        return db.query(Quota).filter(Quota.user_id == user_id).first()

    def update_user_quota(self, db: Session, user_id: uuid.UUID, quota_update: QuotaBase):
        quota = self.get_user_quota(db, user_id)
        if quota:
            for key, value in quota_update.dict(exclude_unset=True).items():
                setattr(quota, key, value)
            db.commit()
            db.refresh(quota)
        return quota
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\quota_service.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\user_service.py ---
# --- File: backendApp/services/user_service.py ---
# This file contains the business logic for User operations.

from sqlalchemy.orm import Session
from backendApp.models.postgres_models import User, Quota
from backendApp.schemas.user_schemas import UserCreate, UserBase
from backendApp.schemas.quota_schemas import QuotaBase
import uuid

class UserService:
    def create_user(self, db: Session, user: UserCreate):
        db_user = User(
            name=user.name,
            email=user.email,
            password_hash=user.password, # In real app, hash this password
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        # Create a default quota for the new user
        db_quota = Quota(user_id=db_user.user_id)
        db.add(db_quota)
        db.commit()
        db.refresh(db_quota)
        return db_user

    def get_user(self, db: Session, user_id: uuid.UUID):
        return db.query(User).filter(User.user_id == user_id).first()

    def update_user(self, db: Session, user_id: uuid.UUID, user_update: UserBase):
        user = self.get_user(db, user_id)
        if user:
            for key, value in user_update.dict(exclude_unset=True).items():
                setattr(user, key, value)
            db.commit()
            db.refresh(user)
        return user

    def delete_user(self, db: Session, user_id: uuid.UUID):
        user = self.get_user(db, user_id)
        if user:
            db.delete(user)
            db.commit()
            return True
        return False
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\user_service.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\__init__.py ---
# --- File: backendApp/services/__init__.py ---
# This file makes the 'services' directory a Python package.
# It can also be used to export service instances.

from .user_service import UserService
from .quota_service import QuotaService
from .chat_session_service import ChatSessionService
from .prompt_service import PromptService
from .audit_service import AuditService
from .auth_service import AuthService # New import

user_service = UserService()
quota_service = QuotaService()
chat_session_service = ChatSessionService()
prompt_service = PromptService()
audit_service = AuditService()
auth_service = AuthService() # New service instance
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\services\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\utils\__init__.py ---
# --- File: backendApp/utils/__init__.py ---
# This file makes the 'utils' directory a Python package.
# It can contain general utility functions.

# # Example: You could move get_db here if preferred, but it's often kept with app.py
# # from sqlalchemy.orm import Session
# # from contextlib import contextmanager

# # @contextmanager
# # def get_db_session(SessionLocal):
# #     db = SessionLocal()
# #     try:
# #         yield db
# #     finally:
# #         db.close()
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-da\backendApp\utils\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\llm_responses.py ---
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage

from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# === LLM Initialization ===

def get_openai_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",  # or "gpt-3.5-turbo"
        temperature=0.7,
    )

def get_groq_llm():
    return ChatGroq(
        model="llama-3.1-8b-instant",  # or llama3-70b-8192, gemma-7b-it, etc.
        temperature=0.7,
    )

def get_gemini_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.7,
    )

# === Unified Response Function ===

def get_llm_responses(user_input: str) -> dict:
    message = [HumanMessage(content=user_input)]

    openai_llm = get_openai_llm()
    groq_llm = get_groq_llm()
    gemini_llm = get_gemini_llm()

    return {
        "openai": openai_llm.invoke(message).content,
        "groq": groq_llm.invoke(message).content,
        "gemini": gemini_llm.invoke(message).content,
    }


if __name__ == "__main__":
    user_input = "Write me a haiku about samurai."
    responses = get_llm_responses(user_input)
    
    for provider, response in responses.items():
        print(f"{provider.capitalize()} Response:\n{response}\n")
        
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\llm_responses.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\simulation_of_pydantic_models_old.py ---
# from datetime import datetime, timezone
# from typing import List
# import uuid
# import time
# import random

# # Import models from the other file
# from api.pydantic_models import (
#     ModelProvider,
#     ModelName,
#     QueryInputForComparison,
#     QueryResponse,
#     ComparisonResponse
# )

# # --- Simulation of Provider-Specific Services/Endpoints ---
# # In a real FastAPI app, these would be separate endpoint functions
# # or calls to other microservices, likely in their own modules.

# def get_openai_response_from_service(
#     question: str, session_id: str, model_to_use: ModelName = ModelName.GPT_4O_MINI
# ) -> QueryResponse:
#     """Simulates calling an OpenAI-specific service/endpoint."""
#     print(f"SERVICE_CALL: OpenAI service called for model {model_to_use.value} with session {session_id}...")
#     request_time = datetime.now(timezone.utc)
#     # Simulate API call latency
#     simulated_latency_seconds = 0.5 + (random.random() * 0.5) # 0.5 to 1.0 seconds
#     time.sleep(simulated_latency_seconds)
#     response_time = datetime.now(timezone.utc)

#     # Dummy answer
#     answer = f"OpenAI ({model_to_use.value}) response to: '{question}' - The advancements include better reasoning and multimodal capabilities."

#     return QueryResponse(
#         answer=answer,
#         session_id=session_id,
#         model=model_to_use,
#         provider=model_to_use.get_provider(), # Derive provider from model
#         request_timestamp=request_time,
#         response_timestamp=response_time,
#         latency_ms=round((response_time - request_time).total_seconds() * 1000, 2)
#     )

# def get_google_response_from_service(
#     question: str, session_id: str, model_to_use: ModelName = ModelName.GEMINI_1_5_FLASH_LATEST
# ) -> QueryResponse:
#     """Simulates calling a Google-specific service/endpoint."""
#     print(f"SERVICE_CALL: Google service called for model {model_to_use.value} with session {session_id}...")
#     request_time = datetime.now(timezone.utc)
#     # Simulate API call latency
#     simulated_latency_seconds = 0.4 + (random.random() * 0.4) # 0.4 to 0.8 seconds
#     time.sleep(simulated_latency_seconds)
#     response_time = datetime.now(timezone.utc)

#     # Dummy answer
#     answer = f"Google ({model_to_use.value}) response to: '{question}' - Key progress in large context windows and multimodal understanding."

#     return QueryResponse(
#         answer=answer,
#         session_id=session_id,
#         model=model_to_use,
#         provider=model_to_use.get_provider(), # Derive provider from model
#         request_timestamp=request_time,
#         response_timestamp=response_time,
#         latency_ms=round((response_time - request_time).total_seconds() * 1000, 2)
#     )

# # Groq service would exist but is not called in this specific comparison
# def get_groq_response_from_service(
#     question: str, session_id: str, model_to_use: ModelName = ModelName.LLAMA3_8B_8192
# ) -> QueryResponse:
#     """Simulates calling a Groq-specific service/endpoint."""
#     print(f"SERVICE_CALL: Groq service called for model {model_to_use.value} with session {session_id}...")
#     request_time = datetime.now(timezone.utc)
#     simulated_latency_seconds = 0.3 + (random.random() * 0.3)
#     time.sleep(simulated_latency_seconds)
#     response_time = datetime.now(timezone.utc)
#     answer = f"Groq ({model_to_use.value}) response: '{question}' - Speed and open models are key for many applications."
#     return QueryResponse(
#         answer=answer,
#         session_id=session_id,
#         model=model_to_use,
#         provider=model_to_use.get_provider(), # Derive provider from model
#         request_timestamp=request_time,
#         response_timestamp=response_time,
#         latency_ms=round((response_time - request_time).total_seconds() * 1000, 2)
#     )


# # --- "Comparison" Handler Logic ---
# # This would be your FastAPI endpoint function that orchestrates the calls.

# def compare_openai_and_google_handler(
#     input_data: QueryInputForComparison,
#     openai_model_choice: ModelName = ModelName.GPT_4O_MINI,
#     google_model_choice: ModelName = ModelName.GEMINI_1_5_FLASH_LATEST
# ) -> ComparisonResponse:
#     """
#     Handles a request to compare OpenAI and Google models for a given question.
#     """
#     all_responses: List[QueryResponse] = []
#     print(f"HANDLER: Starting comparison for session {input_data.session_id}, question: '{input_data.question}'")

#     # Call OpenAI service
#     try:
#         print(f"HANDLER: Requesting OpenAI model: {openai_model_choice.value}")
#         openai_resp = get_openai_response_from_service(
#             question=input_data.question,
#             session_id=input_data.session_id, # Pass the shared session_id
#             model_to_use=openai_model_choice
#         )
#         all_responses.append(openai_resp)
#     except Exception as e:
#         print(f"HANDLER_ERROR: Error getting OpenAI response: {e}")
#         # In a real app, you might add an error placeholder to `all_responses`
#         # or raise an exception that the FastAPI framework can handle.

#     # Call Google service
#     try:
#         print(f"HANDLER: Requesting Google model: {google_model_choice.value}")
#         google_resp = get_google_response_from_service(
#             question=input_data.question,
#             session_id=input_data.session_id, # Pass the shared session_id
#             model_to_use=google_model_choice
#         )
#         all_responses.append(google_resp)
#     except Exception as e:
#         print(f"HANDLER_ERROR: Error getting Google response: {e}")

#     comparison_result = ComparisonResponse(
#         original_question=input_data.question,
#         session_id=input_data.session_id,
#         responses=all_responses,
#     )
#     print(f"HANDLER: Comparison complete for session {input_data.session_id}")
#     return comparison_result


# # --- Main Test Execution ---
# if __name__ == "__main__":
#     # 1. User makes a request to the "comparison" endpoint
#     user_query = QueryInputForComparison(
#         question="What are the ethical considerations of advanced AI?"
#     )
#     print(f"TEST_MAIN: User Query for Comparison: {user_query.model_dump_json(indent=2)}\n")

#     # 2. The comparison handler processes the request
#     # We can specify which exact models from OpenAI and Google to use for this comparison
#     comparison_result_data = compare_openai_and_google_handler(
#         input_data=user_query,
#         openai_model_choice=ModelName.GPT_4O,
#         google_model_choice=ModelName.GEMINI_1_5_PRO_LATEST
#     )

#     # 3. The result is a ComparisonResponse
#     print("\n--- Side-by-Side Comparison Result (OpenAI & Google) ---")
#     print(comparison_result_data.model_dump_json(indent=2))

#     print("\n" + "="*50 + "\n")

#     # Another example with default models
#     user_query_2 = QueryInputForComparison(
#         question="How can AI help in climate change mitigation?"
#     )
#     print(f"TEST_MAIN: User Query 2 for Comparison: {user_query_2.model_dump_json(indent=2)}\n")

#     comparison_result_data_2 = compare_openai_and_google_handler(
#         input_data=user_query_2
#         # openai_model_choice defaults to GPT_4O_MINI
#         # google_model_choice defaults to GEMINI_1_5_FLASH_LATEST
#     )
#     print("\n--- Side-by-Side Comparison Result 2 (Defaults) ---")
#     print(comparison_result_data_2.model_dump_json(indent=2))


#     # Example showing Groq model is available (though not in the above comparison)
#     print("\n" + "="*50 + "\n")
#     print("TEST_MAIN: Demonstrating individual Groq model call (not part of comparison handler)")
#     groq_test_query = QueryInputForComparison(question="Tell me about large language models on Groq.")
#     # Directly call the simulated Groq service for this test
#     groq_single_response = get_groq_response_from_service(
#         question=groq_test_query.question,
#         session_id=groq_test_query.session_id,
#         model_to_use=ModelName.LLAMA3_70B_8192
#     )
#     print("\n--- Single Groq Model Response (Test) ---")
#     print(groq_single_response.model_dump_json(indent=2))
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\simulation_of_pydantic_models_old.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\__init__.py ---

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\helper_functions.py ---

from datetime import datetime, timezone

from typing import Optional, List


from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import Runnable
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from api.pydantic_models import ChatMessageAPI, ModelName, SingleModelChatRequest, QueryResponse


def convert_api_history_to_langchain_messages(
    api_history: Optional[List[ChatMessageAPI]]
) -> List[BaseMessage]:
    if not api_history:
        return []
    lc_messages: List[BaseMessage] = []
    for msg in api_history:
        role = msg.role # Already normalized by ChatMessageAPI validator
        if role in ["user", "human"]:
            lc_messages.append(HumanMessage(content=msg.content))
        elif role in ["assistant", "ai"]:
            lc_messages.append(AIMessage(content=msg.content))
        elif role == "system":
            lc_messages.append(SystemMessage(content=msg.content))
    return lc_messages

async def execute_single_llm_chat(
    chain: Runnable,
    model_name_enum: ModelName,
    request_data: SingleModelChatRequest,
    langchain_history: List[BaseMessage]
) -> QueryResponse:
    """
    Executes a given LLM chain and packages the result into a QueryResponse.
    """
    request_time = datetime.now(timezone.utc)
    try:
        # The chain will now return a dictionary with 'answer' and 'raw' keys.
        response_dict = await chain.ainvoke({
            "input": request_data.question,
            "chat_history": langchain_history
        })
        # Extract the individual components from the response dictionary.
        answer_text = response_dict.get("answer")
        raw_model_output = response_dict.get("raw") 
        
        response_time = datetime.now(timezone.utc)
        latency = (response_time - request_time).total_seconds() * 1000
        return QueryResponse(
            answer=answer_text,
            raw_response=raw_model_output,
            session_id=request_data.session_id,
            model=model_name_enum,
            provider=model_name_enum.get_provider(),
            request_timestamp=request_time,
            response_timestamp=response_time,
            latency_ms=latency
        )
    except Exception as e:
        response_time = datetime.now(timezone.utc)
        latency = (response_time - request_time).total_seconds() * 1000
        print(f"Error invoking model {model_name_enum.value}: {type(e).__name__} - {e}") # Log full error server-side
        return QueryResponse(
            error_message=f"Error from {model_name_enum.value}: {type(e).__name__} - {str(e)}",
            session_id=request_data.session_id,
            model=model_name_enum,
            provider=model_name_enum.get_provider(),
            request_timestamp=request_time,
            response_timestamp=response_time,
            latency_ms=latency
        )
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\helper_functions.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\langchain_model_chains.py ---
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import Runnable, RunnableParallel, RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import List, Dict, Any 


# Common components for simple chains
# output_parser = StrOutputParser()

chat_llm_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI assistant..."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ]
)

output_structure_chain = RunnableParallel(
    raw=RunnablePassthrough(),
    answer=StrOutputParser()
)


def get_openai_llm_chain(model_name: str) -> Runnable:
    """
    Creates a LangChain LCEL chain for an OpenAI model with chat history support.

    Args:
        model_name (str): The name of the OpenAI model to use.

    Returns:
        Runnable: A LangChain runnable chain.
                  The chain expects a dictionary with "input" (str) and
                  "chat_history" (List[BaseMessage]) keys.
                  "chat_history" can be an empty list for the first turn.
    """
    llm = ChatOpenAI(model=model_name)
    chain = chat_llm_prompt | llm | output_structure_chain
    return chain

def get_google_llm_chain(model_name: str) -> Runnable:
    """
    Creates a LangChain LCEL chain for a Google (Gemini) model with chat history support.

    Args:
        model_name (str): The name of the Google model to use.

    Returns:
        Runnable: A LangChain runnable chain.
                  The chain expects a dictionary with "input" (str) and
                  "chat_history" (List[BaseMessage]) keys.
                  "chat_history" can be an empty list for the first turn.
    """
    llm = ChatGoogleGenerativeAI(model=model_name)
    chain = chat_llm_prompt | llm | output_structure_chain
    return chain

def get_groq_llm_chain(model_name: str) -> Runnable:
    """
    Creates a LangChain LCEL chain for a Groq model with chat history support.

    Args:
        model_name (str): The name of the Groq model to use.

    Returns:
        Runnable: A LangChain runnable chain.
                  The chain expects a dictionary with "input" (str) and
                  "chat_history" (List[BaseMessage]) keys.
                  "chat_history" can be an empty list for the first turn.
    """
    llm = ChatGroq(model=model_name) # Groq uses model_name parameter
    chain = chat_llm_prompt | llm | output_structure_chain
    return chain


# if __name__ == '__main__':
#     # Ensure your API keys are set in your environment.

#     # --- Using string literals for model names (or your ModelName enum if available) ---
#     openai_model_str = "gpt-4o-mini"
#     google_model_str = "gemini-1.5-flash-latest"
#     groq_model_str = "llama3-8b-8192"

#     # Initialize chains
#     openai_chain = get_openai_llm_chain(model_name=openai_model_str)
#     google_chain = get_google_llm_chain(model_name=google_model_str)
#     groq_chain = get_groq_llm_chain(model_name=groq_model_str)

#     # --- Example Conversation with OpenAI ---
#     print(f"--- Testing Chat with OpenAI ({openai_model_str}) ---")
#     chat_history_openai: List[Any] = [] # Use List[Any] or List[BaseMessage]

#     # Turn 1
#     user_input_1 = "My name is Bob. What is the color of the sky during a clear day?"
#     print(f"User: {user_input_1}")
#     try:
#         response_1 = openai_chain.invoke({
#             "chat_history": chat_history_openai,
#             "input": user_input_1,
#         })
#         print(f"OpenAI: {response_1}")
#         chat_history_openai.append(HumanMessage(content=user_input_1))
#         chat_history_openai.append(AIMessage(content=response_1))
#     except Exception as e:
#         print(f"Error with OpenAI: {e}")

#     # Turn 2 (with history)
#     user_input_2 = "What is my name?"
#     print(f"\nUser: {user_input_2}")
#     if chat_history_openai: # Only try if previous turn was successful
#         try:
#             response_2 = openai_chain.invoke({
#                 "chat_history": chat_history_openai,
#                 "input": user_input_2
#             })
#             print(f"OpenAI: {response_2}")
#             chat_history_openai.append(HumanMessage(content=user_input_2))
#             chat_history_openai.append(response_2)
#         except Exception as e:
#             print(f"Error with OpenAI: {e}")
#     print("-" * 30)

    # # --- Example Conversation with Google ---
    # print(f"\n--- Testing Chat with Google ({google_model_str}) ---")
    # chat_history_google: List[Any] = []

    # # Turn 1
    # user_input_g1 = "What is the capital of Germany?"
    # print(f"User: {user_input_g1}")
    # try:
    #     response_g1 = google_chain.invoke({
    #         "input": user_input_g1,
    #         "chat_history": chat_history_google
    #     })
    #     print(f"Google: {response_g1}")
    #     chat_history_google.append(HumanMessage(content=user_input_g1))
    #     chat_history_google.append(AIMessage(content=response_g1))
    # except Exception as e:
    #     print(f"Error with Google: {e}")

    # # Turn 2 (with history)
    # user_input_g2 = "And what is its primary spoken language?"
    # print(f"\nUser: {user_input_g2}")
    # if chat_history_google:
    #     try:
    #         response_g2 = google_chain.invoke({
    #             "input": user_input_g2,
    #             "chat_history": chat_history_google
    #         })
    #         print(f"Google: {response_g2}")
    #         chat_history_google.append(HumanMessage(content=user_input_g2))
    #         chat_history_google.append(AIMessage(content=response_g2))
    #     except Exception as e:
    #         print(f"Error with Google: {e}")
    # print("-" * 30)

    # # --- Example Conversation with Groq ---
    # # Note: LLaMA models might not be as strong at remembering names or conversational context
    # # without very specific prompting or fine-tuning, but the mechanism is the same.
    # print(f"\n--- Testing Chat with Groq ({groq_model_str}) ---")
    # chat_history_groq: List[Any] = []

    # # Turn 1
    # user_input_gr1 = "I like the color blue. What are two common fruits that are blue?"
    # print(f"User: {user_input_gr1}")
    # try:
    #     response_gr1 = groq_chain.invoke({
    #         "input": user_input_gr1,
    #         "chat_history": chat_history_groq
    #     })
    #     print(f"Groq: {response_gr1}")
    #     chat_history_groq.append(HumanMessage(content=user_input_gr1))
    #     chat_history_groq.append(AIMessage(content=response_gr1))
    # except Exception as e:
    #     print(f"Error with Groq: {e}")

    # # Turn 2 (with history)
    # user_input_gr2 = "What was the color I said I liked?"
    # print(f"\nUser: {user_input_gr2}")
    # if chat_history_groq:
    #     try:
    #         response_gr2 = groq_chain.invoke({
    #             "input": user_input_gr2,
    #             "chat_history": chat_history_groq
    #         })
    #         print(f"Groq: {response_gr2}")
    #         # Not adding to history here for brevity in example
    #     except Exception as e:
    #         print(f"Error with Groq: {e}")
    # print("-" * 30)
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\langchain_model_chains.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\main.py ---
from fastapi import FastAPI, HTTPException, Body, Path
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
import os # Import os to read environment variables

from api.pydantic_models import QueryResponse, ModelName, SingleModelChatRequest, ModelProvider
from api.helper_functions import convert_api_history_to_langchain_messages, execute_single_llm_chat
from api.langchain_model_chains import get_openai_llm_chain, get_google_llm_chain, get_groq_llm_chain

app = FastAPI(
    title="TellMeMore LLM Models API",
    description="API with separate endpoints for querying different LLM providers with chat history support.",
    version="0.1",
)

# --- CORS Configuration ---
# Get CORS origins from environment variable, defaulting to common development origins
# This should match the origin of your frontend application (e.g., http://127.0.0.1:8080)
origins = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080").split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers, including Authorization
)

# OpenAPI endpoint
@app.post("/chat/openai/{model_name}", response_model=QueryResponse, tags=["OpenAI Chat"])
async def chat_with_openai_model(
    model_name: ModelName = Path(..., description="The OpenAI model to use for the chat"),
    request_body: SingleModelChatRequest = Body(...)
):
    if model_name.get_provider() != ModelProvider.OPENAI:
        raise HTTPException(
            status_code=400,
            detail=f"Model {model_name.value} is not an OpenAI model. Please use a valid OpenAI model name."
        )
        
    langchain_chat_history = convert_api_history_to_langchain_messages(request_body.chat_history)
    chain = get_openai_llm_chain(model_name=model_name.value)
    return await execute_single_llm_chat(
        chain=chain,
        model_name_enum=model_name,
        request_data=request_body,
        langchain_history=langchain_chat_history
    )
    
# --- Google Endpoint ---
@app.post("/chat/google/{model_name_path}", response_model=QueryResponse, tags=["Google Chat"])
async def chat_with_google_model(
    model_name_path: ModelName = Path(..., description="The specific Google Gemini model name to use."),
    request_body: SingleModelChatRequest = Body(...)
):
    if model_name_path.get_provider() != ModelProvider.GOOGLE:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_name_path.value}' is not a Google model. Please use a Google Gemini model name."
        )
    langchain_chat_history = convert_api_history_to_langchain_messages(request_body.chat_history)
    chain = get_google_llm_chain(model_name=model_name_path.value)
    return await execute_single_llm_chat(
        chain=chain, model_name_enum=model_name_path, request_data=request_body, langchain_history=langchain_chat_history
    )

# --- Groq Endpoint ---
@app.post("/chat/groq/{model_name_path}", response_model=QueryResponse, tags=["Groq Chat"])
async def chat_with_groq_model(
    model_name_path: ModelName = Path(..., description="The specific Groq LLaMA model name to use."),
    request_body: SingleModelChatRequest = Body(...)
):
    if model_name_path.get_provider() != ModelProvider.GROQ:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_name_path.value}' is not a Groq model. Please use a Groq LLaMA model name."
        )
    langchain_chat_history = convert_api_history_to_langchain_messages(request_body.chat_history)
    chain = get_groq_llm_chain(model_name=model_name_path.value)
    return await execute_single_llm_chat(
        chain=chain, model_name_enum=model_name_path, request_data=request_body, langchain_history=langchain_chat_history
    )

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\main.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\pydantic_models.py ---
from pydantic import BaseModel, Field, field_validator, ValidationError
from enum import Enum
from datetime import datetime, timezone
from typing import Optional, List, Any
import uuid

class ModelProvider(str, Enum):
    OPENAI = "openai"
    GOOGLE = "google"
    GROQ = "groq"

class ModelName(str, Enum):
    """
    Enum representing supported language models across multiple providers.

    Models are categorized by provider:
    - OpenAI: GPT-4 series
    - Google: Gemini models
    - Groq Cloud: LLaMA3 variants

    This enum enables strong validation and consistency when referring to models
    throughout the application.

    Attributes:
        GPT_4O: OpenAI's GPT-4o model
        GPT_4O_MINI: Hypothetical variant of GPT-4o (e.g., smaller version)
        GEMINI_1_5_PRO_LATEST: Latest Google Gemini 1.5 Pro model
        GEMINI_1_5_FLASH_LATEST: Latest Google Gemini 1.5 Flash model
        GEMINI_1_0_PRO: Google Gemini 1.0 Pro model
        LLAMA3_8B_8192: Groq's hosted LLaMA3 8B model
        LLAMA3_70B_8192: Groq's hosted LLaMA3 70B model
    """
    # OpenAI Models
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"

    # Google Models
    GEMINI_1_5_PRO_LATEST = "gemini-1.5-pro-latest"
    GEMINI_1_5_FLASH_LATEST = "gemini-1.5-flash-latest"
    GEMINI_1_0_PRO = "gemini-1.0-pro"

    # Groq Cloud Models (still defined, but not used in every comparison)
    LLAMA3_8B_8192 = "llama3-8b-8192"
    LLAMA3_70B_8192 = "llama3-70b-8192"

    def get_provider(self) -> ModelProvider:
        """
        Returns the provider associated with the model name.

        This helper method infers the provider (OpenAI, Google, Groq)
        by inspecting the model's value. This is useful for dynamically
        routing model usage logic based on source.

        Returns:
            ModelProvider: The corresponding provider enum.

        Raises:
            ValueError: If the provider cannot be determined from the model name.
        """
        value_lower = self.value.lower()
        if value_lower.startswith("gpt"):
            return ModelProvider.OPENAI
        elif value_lower.startswith("gemini"):
            return ModelProvider.GOOGLE
        elif "llama3" in value_lower: # Simplified for the Groq models we have
            return ModelProvider.GROQ
        raise ValueError(f"Could not determine provider for model: {self.value}")


# Helper model for chat history input in the API
class ChatMessageAPI(BaseModel):
    role: str = Field(..., examples=["user", "assistant"])
    content: str

    @field_validator('role')
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        role_lower = v.lower()
        if role_lower not in ["user", "assistant", "system", "human", "ai"]: # Allow more for flexibility
            raise ValueError("Role must be one of 'user', 'assistant', 'system', 'human', 'ai'")
        return role_lower
    
# class QueryInputForComparison(BaseModel):
#     """
#     Request model for submitting a query to the LLM comparison endpoint.

#     This model is used to encapsulate the user's input question and an optional session ID.
#     The session ID allows grouping multiple requests into a single logical session for
#     tracking, analysis, or UI display purposes.

#     Attributes:
#         question (str): The input question or prompt to be compared across different LLM providers.
#         session_id (Optional[str]): A unique identifier for the session. If not provided, a new UUID
#                                     is automatically generated to uniquely identify the request context.
#     """
#     question: str
#     session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    
#     @field_validator('session_id', mode='before') # (B)
#     @classmethod
#     def set_session_id_if_none(cls, v):
#         return v or str(uuid.uuid4())

# Request body for individual LLM chat endpoints
class SingleModelChatRequest(BaseModel):
    question: str = Field(..., examples=["What is the capital of France?"])
    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    chat_history: Optional[List[ChatMessageAPI]] = Field(
        default_factory=list,
        examples=[[{"role": "user", "content": "My name is Bob."}]]
    )

    @field_validator('session_id', mode='before')
    @classmethod
    def set_session_id_if_none(cls, v: Optional[str]) -> str:
        return v or str(uuid.uuid4())

class QueryResponse(BaseModel):
    """
    Represents a single response returned by an AI model in a comparison session.

    This model is used to structure the metadata and result of a model's response to a query.
    It includes timing information, the model identity, and the associated session ID.

    Attributes:
        answer (str): The textual response generated by the AI model.
        session_id (str): Unique identifier for the comparison session this response belongs to.
        model (ModelName): The specific model that generated the response (e.g., GPT-4o, Gemini).
        provider (ModelProvider): The provider associated with the model (e.g., OpenAI, Google, Groq).
        request_timestamp (datetime): The timestamp when the query was sent to the model.
        response_timestamp (datetime): The timestamp when the response was received from the model.
        latency_ms (float): The total time taken to receive the model's response, in milliseconds.
    """
    answer: Optional[str] = None
    raw_response: Optional[Any] = None
    error_message: Optional[str] = None
    session_id: str
    model: ModelName
    provider: ModelProvider
    request_timestamp: datetime
    response_timestamp: datetime
    latency_ms: float
    
    @field_validator('request_timestamp', 'response_timestamp', mode='before')
    @classmethod
    def ensure_datetime_is_aware(cls, v: datetime) -> datetime: # Use `any` for `v` if it might be a string from JSON
        """
        Validates that the datetime field is timezone-aware.
        This runs AFTER Pydantic has converted the input to a datetime object.
        """
        if v.tzinfo is None:
            raise ValueError("Datetime must be timezone-aware (UTC).")
        return v.astimezone(timezone.utc)
    

class ComparisonResponse(BaseModel):
    """
    Represents the collection of responses from multiple language models for a single input query.

    This model is used to return all model responses for a given question, grouped under a shared
    session ID. It includes metadata such as the original user question and the timestamp when the
    comparison was performed.

    Attributes:
        original_question (str): The user-provided question that was submitted to all models.
        session_id (str): Unique identifier used to group all model responses under a single session.
        responses (List[QueryResponse]): A list of individual responses from each model involved in the comparison.
        comparison_timestamp (datetime): The timestamp when the comparison was completed. Defaults to the current UTC time.
    """
    original_question: str
    session_id: str
    responses: List[QueryResponse]
    comparison_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\pydantic_models.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\tbd.py ---
# Entry point for FastAPI application

from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic_models import QueryInput, QueryResponse, DocumentInfo, DeleteFileRquest
from langchain_utils import get_rag_chain
from db_utils import insert_application_logs, get_chat_history, get_all_documents, insert_document_record, delete_document_record
from chroma_utils import index_document_to_chroma, delete_doc_from_chroma

import os
import uuid
import logging
import shutil
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Set up logging
logging.basicConfig(filename='app.log', level=logging.INFO)

# Initialize the FastAPI app
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Chatbot API. Please refer to the documentation for usage instructions."}


# Main endpoints 

## Chat endpoint
@app.post("/chat", response_model=QueryResponse)
def chat(query_input: QueryInput):
    session_id = query_input.session_id or str(uuid.uuid4())
    logging.info(f"Session ID: {session_id}, User Query: {query_input.question}, Model: {query_input.model.value}")

    chat_history = get_chat_history(session_id)
    rag_chain = get_rag_chain(query_input.model.value)
    answer = rag_chain.invoke(
        {
            "input": query_input.question,
            "chat_history": chat_history
        }
    )['answer']  # Because the query response is a dictionary set by pydantic_models.py

    insert_application_logs(session_id, query_input.question, answer, query_input.model.value)
    logging.info(f"Session ID: {session_id}, AI Response: {answer}")
    return QueryResponse(answer=answer, session_id=session_id, model=query_input.model)


--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\tbd.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\__init__.py ---

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\api\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\tests\test_pydantic_models.py ---
# test_models.py
import pytest
from datetime import datetime, timezone
import uuid
from pydantic import ValidationError

# Assuming models.py is in the same directory or accessible in PYTHONPATH
# If models.py is in a parent directory/package, adjust the import accordingly
# e.g., from ..models import ModelName, ... or from your_package.models import ...
from ..api.pydantic_models import (
    ModelProvider,
    ModelName,
    QueryInputForComparison,
    QueryResponse,
    ComparisonResponse
)

# --- Test Cases for ModelName ---

def test_model_name_get_provider():
    assert ModelName.GPT_4O.get_provider() == ModelProvider.OPENAI
    assert ModelName.GPT_4O_MINI.get_provider() == ModelProvider.OPENAI
    assert ModelName.GEMINI_1_5_PRO_LATEST.get_provider() == ModelProvider.GOOGLE
    assert ModelName.GEMINI_1_5_FLASH_LATEST.get_provider() == ModelProvider.GOOGLE
    assert ModelName.LLAMA3_8B_8192.get_provider() == ModelProvider.GROQ
    assert ModelName.LLAMA3_70B_8192.get_provider() == ModelProvider.GROQ

# --- Test Cases for QueryInputForComparison ---

def test_query_input_valid():
    question_text = "What is Pydantic?"
    inp = QueryInputForComparison(question=question_text)
    assert inp.question == question_text
    assert isinstance(inp.session_id, str)
    try:
        uuid.UUID(inp.session_id) # Check if it's a valid UUID string
    except ValueError:
        pytest.fail("session_id is not a valid UUID string")

def test_query_input_with_session_id():
    question_text = "Test question"
    custom_session_id = "my-custom-session-123"
    inp = QueryInputForComparison(question=question_text, session_id=custom_session_id)
    assert inp.question == question_text
    assert inp.session_id == custom_session_id

def test_query_input_session_id_is_none():
    question_text = "Test question with None session_id"
    inp = QueryInputForComparison(question=question_text, session_id=None)
    assert inp.question == question_text
    assert isinstance(inp.session_id, str) # Should be auto-generated

def test_query_input_missing_question():
    with pytest.raises(ValidationError) as excinfo:
        QueryInputForComparison() # No question provided
    assert "question" in str(excinfo.value).lower()
    assert "field required" in str(excinfo.value).lower()

def test_query_input_invalid_question_type():
    with pytest.raises(ValidationError):
        QueryInputForComparison(question=123) # Invalid type for question

# --- Test Cases for QueryResponse ---

@pytest.fixture
def sample_timestamps():
    now = datetime.now(timezone.utc)
    return {
        "request": now,
        "response": datetime.fromtimestamp(now.timestamp() + 1, tz=timezone.utc)
    }

@pytest.fixture
def valid_query_response_data(sample_timestamps):
    return {
        "answer": "This is a test answer.",
        "session_id": str(uuid.uuid4()),
        "model": ModelName.GPT_4O_MINI,
        "provider": ModelProvider.OPENAI,
        "request_timestamp": sample_timestamps["request"],
        "response_timestamp": sample_timestamps["response"],
        "latency_ms": 1000.5
    }

def test_query_response_valid(valid_query_response_data):
    resp = QueryResponse(**valid_query_response_data)
    assert resp.answer == valid_query_response_data["answer"]
    assert resp.model == ModelName.GPT_4O_MINI
    assert resp.provider == ModelProvider.OPENAI
    assert resp.latency_ms == 1000.5
    assert resp.request_timestamp.tzinfo == timezone.utc
    assert resp.response_timestamp.tzinfo == timezone.utc

def test_query_response_missing_answer(valid_query_response_data):
    data = valid_query_response_data.copy()
    del data["answer"]
    with pytest.raises(ValidationError):
        QueryResponse(**data)

def test_query_response_invalid_model_type(valid_query_response_data):
    data = valid_query_response_data.copy()
    data["model"] = "not-a-model" # Invalid enum value
    with pytest.raises(ValidationError):
        QueryResponse(**data)

def test_query_response_invalid_latency_type(valid_query_response_data):
    data = valid_query_response_data.copy()
    data["latency_ms"] = "not-a-float"
    with pytest.raises(ValidationError):
        QueryResponse(**data)

def test_query_response_raises_error_for_naive_datetime_input(valid_query_response_data):
    data_with_naive_request  = valid_query_response_data.copy()
    navie_dt = datetime.now()  # Naive datetime
    data_with_naive_request ["request_timestamp"] = navie_dt
    
    with pytest.raises(ValidationError) as excinfo_req:
        QueryResponse(**data_with_naive_request)
    
    # Pydantic v2 will likely coerce this to an aware datetime (often UTC by default)
    # So, we don't expect a ValidationError.

    # Check that our custom error message (or a part of it) is in the Pydantic ValidationError
    assert "datetime must be timezone-aware" in str(excinfo_req.value).lower()
     # You can also check the specific field that failed if needed:
    # assert any(err['type'] == 'value_error' and "timezone-aware" in err['msg'].lower() for err in excinfo_req.value.errors() if err['loc'][0] == 'request_timestamp')

# --- Test Cases for ComparisonResponse ---

@pytest.fixture
def sample_query_response(valid_query_response_data):
    return QueryResponse(**valid_query_response_data)

def test_comparison_response_valid_empty_responses():
    question = "Original question for comparison"
    session_id = str(uuid.uuid4())
    comp_resp = ComparisonResponse(
        original_question=question,
        session_id=session_id,
        responses=[]
    )
    assert comp_resp.original_question == question
    assert comp_resp.session_id == session_id
    assert len(comp_resp.responses) == 0
    assert isinstance(comp_resp.comparison_timestamp, datetime)
    assert comp_resp.comparison_timestamp.tzinfo == timezone.utc

def test_comparison_response_valid_with_responses(sample_query_response):
    question = "Another original question"
    session_id = str(uuid.uuid4())
    comp_resp = ComparisonResponse(
        original_question=question,
        session_id=session_id,
        responses=[sample_query_response, sample_query_response] # List of valid QueryResponse
    )
    assert len(comp_resp.responses) == 2
    assert isinstance(comp_resp.responses[0], QueryResponse)

def test_comparison_response_missing_original_question():
    with pytest.raises(ValidationError):
        ComparisonResponse(session_id=str(uuid.uuid4()), responses=[])

def test_comparison_response_invalid_responses_type(sample_query_response):
    # Test with a list containing a non-QueryResponse item
    with pytest.raises(ValidationError):
        ComparisonResponse(
            original_question="Test",
            session_id=str(uuid.uuid4()),
            responses=[sample_query_response, {"not_a_response": True}]
        )
    # Test with responses not being a list
    with pytest.raises(ValidationError):
        ComparisonResponse(
            original_question="Test",
            session_id=str(uuid.uuid4()),
            responses="not-a-list"
        )

def test_comparison_response_default_timestamp():
    comp_resp = ComparisonResponse(
        original_question="Q",
        session_id="S",
        responses=[]
    )
    assert isinstance(comp_resp.comparison_timestamp, datetime)
    assert comp_resp.comparison_timestamp.tzinfo == timezone.utc
    # Check it's reasonably close to now
    assert (datetime.now(timezone.utc) - comp_resp.comparison_timestamp).total_seconds() < 1
--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\tests\test_pydantic_models.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\tests\__init__.py ---

--- End of E:/DevProjet/TellMeMore/TellMeMore\Backend-llm\tests\__init__.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Frontend-ui\app.py ---
# TELLMEMORE_FRONTEND_FASTAPI/app.py (Frontend Only)
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

# Import settings from your frontend's config.py
from config import settings
# Import the frontend router from your frontend's routes.py
from routes import router as frontend_router

# --- Lifespan Context Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events for the frontend application.
    """
    port = os.getenv("FRONTEND_PORT", "8080")
    print(f"Frontend Application startup on port {port} (from environment variable/default)...")
    # Diagnostic print to confirm the backend API URL loaded from frontend config
    print(f"DEBUG (frontend app.py): BACKEND_API_URL from config: {settings.BACKEND_API_URL}")
    print(f"DEBUG (frontend app.py): LLM_API_BASE_URL from config: {settings.LLM_API_BASE_URL}")
    yield
    print("Frontend Application shutdown.")

# --- FastAPI Application for Frontend ---
app = FastAPI(
    title="LLM Frontend Application",
    description="Serves the web interface for the LLM Interaction App.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None, # Disable docs for the frontend app
    redoc_url=None # Disable redoc for the frontend app
)

# --- Jinja2 Templates and Static Files Configuration ---
# Define the path to your templates directory
templates_dir = os.path.join(os.path.dirname(__file__), 'frontend_app', 'templates')
templates = Jinja2Templates(directory=templates_dir)

# Define the path to your static files directory
static_dir = os.path.join(os.path.dirname(__file__), 'frontend_app', 'static')
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# --- Include the frontend router ---
# This router will define all the HTML-serving routes (e.g., /, /login, /dashboard)
# and ensure they pass the backend_api_url to the templates.
app.include_router(frontend_router)

# Note: No API endpoints are defined directly in this frontend app.py.
# All API calls will be made from frontend JavaScript to the separate backend.

--- End of E:/DevProjet/TellMeMore/TellMeMore\Frontend-ui\app.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Frontend-ui\config.py ---
# config.py

import os
from pydantic_settings import BaseSettings, SettingsConfigDict # Import SettingsConfigDict

class Settings(BaseSettings):
    # This will load environment variables from .env file
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    FRONTEND_PORT: int = 8080
    BACKEND_API_URL: str = "http://127.0.0.1:8000/api/v1"
    # New setting for the LLM API base URL
    LLM_API_BASE_URL: str = "http://127.0.0.1:8001" # Default value as provided by you

settings = Settings()

print(f"DEBUG (frontend config.py): BACKEND_API_URL loaded: {settings.BACKEND_API_URL}")
print(f"DEBUG (frontend config.py): LLM_API_BASE_URL loaded: {settings.LLM_API_BASE_URL}")
--- End of E:/DevProjet/TellMeMore/TellMeMore\Frontend-ui\config.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Frontend-ui\routes.py ---
# TELLMEMORE_FRONTEND/routes.py (Frontend HTML Routes)
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from config import settings # Import settings for backend and LLM API URLs

# Initialize Jinja2Templates, pointing to the templates directory
# Ensure this path is correct relative to where routes.py is executed
templates = Jinja2Templates(directory="frontend_app/templates")

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
async def auth_page(request: Request):
    """
    Serves the authentication (login/register) page as the default root.
    """
    # Pass both backend and LLM API URLs to the template
    print(f"DEBUG (frontend routes.py): backend_api_url being passed to auth.html: {settings.BACKEND_API_URL}")
    print(f"DEBUG (frontend routes.py): llm_api_base_url being passed to auth.html: {settings.LLM_API_BASE_URL}")
    return templates.TemplateResponse(
        "auth.html",
        {
            "request": request,
            "backend_api_url": settings.BACKEND_API_URL,
            "llm_api_base_url": settings.LLM_API_BASE_URL # Pass LLM API URL
        }
    )

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """
    Serves the authentication (login/register) page.
    """
    # Pass both backend and LLM API URLs to the template
    print(f"DEBUG (frontend routes.py): backend_api_url being passed to auth.html: {settings.BACKEND_API_URL}")
    print(f"DEBUG (frontend routes.py): llm_api_base_url being passed to auth.html: {settings.LLM_API_BASE_URL}")
    return templates.TemplateResponse(
        "auth.html",
        {
            "request": request,
            "backend_api_url": settings.BACKEND_API_URL,
            "llm_api_base_url": settings.LLM_API_BASE_URL # Pass LLM API URL
        }
    )

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """
    Serves a registration page (reusing auth.html).
    """
    # Pass both backend and LLM API URLs to the template
    print(f"DEBUG (frontend routes.py): backend_api_url being passed to auth.html: {settings.BACKEND_API_URL}")
    print(f"DEBUG (frontend routes.py): llm_api_base_url being passed to auth.html: {settings.LLM_API_BASE_URL}")
    return templates.TemplateResponse(
        "auth.html",
        {
            "request": request,
            "is_register": True,
            "backend_api_url": settings.BACKEND_API_URL,
            "llm_api_base_url": settings.LLM_API_BASE_URL # Pass LLM API URL
        }
    )

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    """
    Serves the protected dashboard page.
    """
    # Pass both backend and LLM API URLs to the template
    print(f"DEBUG (frontend routes.py): backend_api_url being passed to dashboard.html: {settings.BACKEND_API_URL}")
    print(f"DEBUG (frontend routes.py): llm_api_base_url being passed to dashboard.html: {settings.LLM_API_BASE_URL}")
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "backend_api_url": settings.BACKEND_API_URL,
            "llm_api_base_url": settings.LLM_API_BASE_URL # Pass LLM API URL
        }
    )

--- End of E:/DevProjet/TellMeMore/TellMeMore\Frontend-ui\routes.py ---

--- Start of E:/DevProjet/TellMeMore/TellMeMore\Frontend-ui\frontend_app\__init__.py ---
# This file makes 'frontend_app' a Python package.
--- End of E:/DevProjet/TellMeMore/TellMeMore\Frontend-ui\frontend_app\__init__.py ---

