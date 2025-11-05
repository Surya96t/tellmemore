# Backend-da: Clerk JWT vs Internal API Audit

**Date:** November 3, 2025  
**Purpose:** Identify all endpoints that still require Clerk JWT and need internal API equivalents

---

## Current Internal Endpoints ✅

These are already implemented in `Backend-da/backendApp/api/internal.py`:

1. ✅ **GET `/internal/users/by-clerk-id/{clerk_user_id}`** - Get/create user by Clerk ID
2. ✅ **GET `/internal/users/{user_id}/sessions`** - Get user's sessions
3. ✅ **POST `/internal/sessions`** - Create new session
4. ✅ **GET `/internal/sessions/{session_id}/prompts`** - Get session chat history
5. ✅ **POST `/internal/prompts`** - Save prompt with LLM responses

---

## Endpoints Still Using Clerk JWT ❌

### 1. **User Quota** (Priority: HIGH 🔥)

#### Current (Clerk JWT):

- `GET /api/v1/users/me/quota` - Get current user's quota
- `PUT /api/v1/users/me/quota` - Update current user's quota

#### Needed Internal Endpoints:

```python
# Backend-da/backendApp/api/internal.py

@router.get("/users/{user_id}/quota", response_model=QuotaResponse)
def get_user_quota_api(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Get user quota by user_id (internal)"""
    quota = user_service.get_user_quota(db, user_id)
    if not quota:
        raise HTTPException(status_code=404, detail="Quota not found")
    return quota


@router.put("/users/{user_id}/quota", response_model=QuotaResponse)
def update_user_quota_api(
    user_id: uuid.UUID,
    quota_update: QuotaBase,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Update user quota by user_id (internal)"""
    updated_quota = user_service.update_user_quota(db, user_id, quota_update)
    if not updated_quota:
        raise HTTPException(status_code=404, detail="Quota not found")
    return updated_quota
```

#### BFF Changes Needed:

- Update `frontend-next/app/api/backend-da/quota/route.ts` to use internal endpoints

---

### 2. **User Prompts** (Priority: HIGH 🔥)

#### Current (Clerk JWT):

- `GET /api/v1/user_prompts` - Get all user prompts for current user
- `POST /api/v1/user_prompts` - Create new user prompt
- `DELETE /api/v1/user_prompts/{prompt_id}` - Delete user prompt

#### Needed Internal Endpoints:

```python
# Backend-da/backendApp/api/internal.py

@router.get("/users/{user_id}/user-prompts", response_model=List[UserPromptResponse])
def get_user_prompts_api(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Get all user prompts for a user (internal)"""
    from backendApp.services.user_prompt_service import UserPromptService
    user_prompt_service = UserPromptService()
    prompts = user_prompt_service.get_user_prompts(db, user_id)
    return prompts


@router.post("/user-prompts", response_model=UserPromptResponse)
def create_user_prompt_api(
    prompt: UserPromptCreate,  # Includes user_id from BFF
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Create user prompt (internal)"""
    from backendApp.services.user_prompt_service import UserPromptService
    user_prompt_service = UserPromptService()
    db_prompt = user_prompt_service.create_user_prompt(db, prompt)
    if not db_prompt:
        raise HTTPException(status_code=500, detail="Failed to create user prompt")
    return db_prompt


@router.delete("/user-prompts/{prompt_id}")
def delete_user_prompt_api(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Delete user prompt (internal)"""
    from backendApp.services.user_prompt_service import UserPromptService
    user_prompt_service = UserPromptService()
    success = user_prompt_service.delete_user_prompt(db, prompt_id)
    if not success:
        raise HTTPException(status_code=404, detail="User prompt not found")
    return {"message": "User prompt deleted successfully"}
```

#### BFF Changes Needed:

- Update `frontend-next/app/api/backend-da/user-prompts/route.ts` to use internal endpoints

---

### 3. **Session Operations** (Priority: MEDIUM)

#### Current (Clerk JWT):

- `GET /api/v1/chat_sessions/{session_id}` - Get single session
- `PUT /api/v1/chat_sessions/{session_id}` - Update session (title, etc.)
- `DELETE /api/v1/chat_sessions/{session_id}` - Delete session

#### Needed Internal Endpoints:

```python
# Backend-da/backendApp/api/internal.py

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session_api(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Get session by ID (internal)"""
    session = chat_session_service.get_chat_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/sessions/{session_id}", response_model=ChatSessionResponse)
def update_session_api(
    session_id: uuid.UUID,
    session_update: ChatSessionBase,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Update session (internal)"""
    updated_session = chat_session_service.update_chat_session(
        db, session_id, session_update
    )
    if not updated_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return updated_session


@router.delete("/sessions/{session_id}")
def delete_session_api(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Delete session (internal)"""
    success = chat_session_service.delete_chat_session(db, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}
```

#### BFF Changes Needed:

- Update `frontend-next/app/api/backend-da/sessions/[sessionId]/route.ts` to use internal endpoints

---

### 4. **System Prompts** (Priority: LOW - Read-only, public data)

#### Current (Clerk JWT):

- `GET /api/v1/system_prompts` - Get all system prompts

#### Internal Endpoint (Optional):

```python
@router.get("/system-prompts", response_model=List[SystemPromptResponse])
def get_system_prompts_api(
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
):
    """Get all system prompts (internal)"""
    from backendApp.services.system_prompt_service import SystemPromptService
    system_prompt_service = SystemPromptService()
    prompts = system_prompt_service.get_all_system_prompts(db)
    return prompts
```

**Note:** System prompts are public data, so Clerk JWT is acceptable here. Low priority.

---

## Summary Table

| Endpoint Category  | Clerk JWT Endpoints        | Internal Endpoints Needed                              | Priority |
| ------------------ | -------------------------- | ------------------------------------------------------ | -------- |
| **User**           | ✅ Already migrated        | `/internal/users/by-clerk-id/{id}`                     | DONE     |
| **Sessions**       | 3 (GET/PUT/DELETE by ID)   | 3 internal endpoints                                   | MEDIUM   |
| **Prompts**        | ✅ Already migrated        | `/internal/sessions/{id}/prompts`, `/internal/prompts` | DONE     |
| **User Prompts**   | 3 (GET list, POST, DELETE) | 3 internal endpoints                                   | HIGH 🔥  |
| **Quota**          | 2 (GET, PUT)               | 2 internal endpoints                                   | HIGH 🔥  |
| **System Prompts** | 1 (GET)                    | 1 internal endpoint (optional)                         | LOW      |

---

## Implementation Priority

### Phase 1: Critical (Blocking Chat) 🔥

1. ✅ **User by Clerk ID** - DONE
2. ✅ **Sessions (create, list)** - DONE
3. ✅ **Prompts (create, list)** - DONE
4. ❌ **Quota (get, update)** - NEEDED NOW (quota errors in logs)
5. ❌ **User Prompts (list, create, delete)** - NEEDED SOON

### Phase 2: Feature Complete

6. Session operations (get by ID, update, delete)
7. System prompts (optional)

---

## Next Steps

1. **Add quota internal endpoints** to `Backend-da/backendApp/api/internal.py`
2. **Add user prompts internal endpoints** to `Backend-da/backendApp/api/internal.py`
3. **Update BFF routes**:
   - `frontend-next/app/api/backend-da/quota/route.ts`
   - `frontend-next/app/api/backend-da/user-prompts/route.ts`
4. **Test end-to-end** with Clerk user

---

**Last Updated:** November 3, 2025  
**Status:** Internal API partially complete, quota & user-prompts needed
