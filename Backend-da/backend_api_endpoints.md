# Backend API Endpoints Reference

This document lists all API endpoints for the backend, grouped by resource, with request and response schemas for each.

**Last Updated:** November 3, 2025

---

## 📚 Related Documentation

### Frontend Integration

- **Phase 4 Complete:** [../frontend-next/docs/PHASE_4_COMPLETE.md](../frontend-next/docs/PHASE_4_COMPLETE.md) - Dual chat interface completion report
- **BFF Layer:** All endpoints are accessed via Next.js BFF routes in `frontend-next/app/api/backend-da/`
- **Internal API:** See [INTERNAL_API_AUDIT.md](./INTERNAL_API_AUDIT.md) for internal endpoints used by BFF

### Migration Guides

- **Migration Plan:** [../frontend-next-migration-plan.md](../frontend-next-migration-plan.md) - Complete migration roadmap
- **Backend Integration:** [../frontend-next/docs/BACKEND_INTEGRATION_STATUS.md](../frontend-next/docs/BACKEND_INTEGRATION_STATUS.md) - BFF integration status

### Key Changes (November 3, 2025)

- ✅ All BFF routes now use internal API endpoints (`/api/v1/internal/*`) with API key authentication
- ✅ Clerk JWT authentication replaced with internal user lookup by `clerk_user_id`
- ✅ All endpoints return proper error handling and logging
- See [BACKEND_FIX_COMPLETE.md](../frontend-next/docs/BACKEND_FIX_COMPLETE.md) for details

---

## Authentication (`/api/v1/auth`)

### POST `/register`

- **Request:** `UserCreate`
- **Response:** `UserResponse`

### POST `/login`

- **Request:** `LoginRequest` (OAuth2PasswordRequestForm)
- **Response:** `Token`

#### Schemas

```python
class LoginRequest(BaseModel):
    username: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "user"
    password: str

class UserResponse(BaseModel):
    user_id: uuid.UUID
    name: str
    email: EmailStr
    role: Optional[str]
    created_at: datetime
```

---

## Users (`/api/v1/users`)

### POST `/`

- **Request:** `UserCreate`
- **Response:** `UserResponse`

### GET `/user_id`

- **Response:** `UserResponse`

### PUT `/user_id`

- **Request:** `UserBase`
- **Response:** `UserResponse`

### DELETE `/user_id`

- **Response:** `{"message": "User deleted successfully"}`

### GET `/user_id/quota`

- **Response:** `QuotaResponse`

### PUT `/user_id/quota`

- **Request:** `QuotaBase`
- **Response:** `QuotaResponse`

#### Schemas

```python
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "user"

class QuotaBase(BaseModel):
    daily_limit: int = 10000
    used_today: int = 0
    last_reset: Optional[datetime] = None

class QuotaResponse(QuotaBase):
    user_id: uuid.UUID
```

---

## Chat Sessions (`/api/v1/chat_sessions`)

### POST `/`

- **Request:** `ChatSessionCreate`
- **Response:** `ChatSessionResponse`

### GET `/session_id`

- **Response:** `ChatSessionResponse`

### GET `/user/user_id`

- **Response:** `List[ChatSessionResponse]`

### PUT `/session_id`

- **Request:** `ChatSessionBase`
- **Response:** `ChatSessionResponse`

### DELETE `/session_id`

- **Response:** `{"message": "Chat session deleted successfully"}`

#### Schemas

```python
class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    user_id: uuid.UUID

class ChatSessionResponse(ChatSessionBase):
    session_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
```

---

## Prompts (`/api/v1/prompts`)

### POST `/`

- **Request:** `PromptCreate`
- **Response:** `PromptResponse`

### GET `/prompt_id`

- **Response:** `PromptResponse`

### GET `/session/session_id`

- **Response:** `List[PromptResponse]`

### PUT `/prompt_id`

- **Request:** `PromptBase`
- **Response:** `PromptResponse`

### DELETE `/prompt_id`

- **Response:** `{"message": "Prompt deleted successfully"}`

#### Schemas

```python
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
```

---

## System Prompts (`/api/v1/system_prompts`)

### POST `/`

- **Request:** `SystemPromptCreate`
- **Response:** `SystemPromptResponse`

### GET `/`

- **Response:** `List[SystemPromptResponse]`

### PUT `/prompt_id`

- **Request:** `SystemPromptBase`
- **Response:** `SystemPromptResponse`

### DELETE `/prompt_id`

- **Response:** `{"message": "Prompt deleted successfully"}`

#### Schemas

```python
class SystemPromptBase(BaseModel):
    prompt_text: str

class SystemPromptCreate(SystemPromptBase):
    pass

class SystemPromptResponse(SystemPromptBase):
    prompt_id: uuid.UUID
```

---

## User Prompts (`/api/v1/user_prompts`)

### POST `/`

- **Request:** `UserPromptCreate`
- **Response:** `UserPromptResponse`

### GET `/user/user_id`

- **Response:** `List[UserPromptResponse]`

### PUT `/prompt_id`

- **Request:** `UserPromptBase`
- **Response:** `UserPromptResponse`

### DELETE `/prompt_id`

- **Response:** `{"message": "Prompt deleted successfully"}`

#### Schemas

```python
class UserPromptBase(BaseModel):
    prompt_text: str

class UserPromptCreate(UserPromptBase):
    user_id: uuid.UUID

class UserPromptResponse(UserPromptBase):
    prompt_id: uuid.UUID
    user_id: uuid.UUID
```

---

## Audit Logs (`/api/v1/audit_logs`)

### POST `/`

- **Request:** `AuditLogCreate`
- **Response:** `AuditLogResponse`

### GET `/log_id`

- **Response:** `AuditLogResponse`

### GET `/user/user_id`

- **Response:** `List[AuditLogResponse]`

#### Schemas

```python
class AuditLogBase(BaseModel):
    action: str
    details: Optional[Dict[str, Any]] = None

class AuditLogCreate(AuditLogBase):
    user_id: uuid.UUID

class AuditLogResponse(AuditLogBase):
    log_id: uuid.UUID
    user_id: uuid.UUID
    timestamp: datetime
```
