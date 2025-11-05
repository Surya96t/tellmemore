# Backend LLM API Endpoints Reference

This document lists all API endpoints for the LLM backend, grouped by provider, with request and response schemas for each. It also describes the key helper functions used in the API flow.

**Last Updated:** November 3, 2025

---

## 📚 Related Documentation

### Frontend Integration

- **Phase 4 Complete:** [frontend-next/docs/PHASE_4_COMPLETE.md](../frontend-next/docs/PHASE_4_COMPLETE.md) - Dual chat interface completion report
- **Chat Data Flow:** [frontend-next/docs/CHAT_DATA_FLOW_VERIFICATION.md](../frontend-next/docs/CHAT_DATA_FLOW_VERIFICATION.md) - End-to-end chat flow
- **BFF Layer:** [frontend-next/app/api/backend-llm/chat/route.ts](../frontend-next/app/api/backend-llm/chat/route.ts) - Next.js BFF proxy for LLM endpoints

### Migration Guides

- **Migration Plan:** [frontend-next-migration-plan.md](../frontend-next-migration-plan.md) - Complete migration roadmap
- **Quick Reference:** [MIGRATION-SUMMARY.md](../MIGRATION-SUMMARY.md) - Model list and key decisions

### Bug Fixes (November 3, 2025)

- ✅ Fixed: Question now appended to messages array in all three endpoints (`/chat/openai`, `/chat/google`, `/chat/groq`)
- ✅ Fixed: Google Gemini serialization error (now returns serializable dict)
- See [CHAT_ENDPOINT_FIX.md](../frontend-next/docs/CHAT_ENDPOINT_FIX.md) for details

---

## Endpoints

### OpenAI Chat

**POST** `/chat/openai/{model_name}`

- **Request:** `SingleModelChatRequest`
- **Response:** `QueryResponse`

### Google Gemini Chat

**POST** `/chat/google/{model_name}`

- **Request:** `SingleModelChatRequest`
- **Response:** `QueryResponse`

### Groq LLaMA3 Chat

**POST** `/chat/groq/{model_name}`

- **Request:** `SingleModelChatRequest`
- **Response:** `QueryResponse`

---

## Request & Response Schemas

### Request: `SingleModelChatRequest`

```python
class SingleModelChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    chat_history: Optional[List[ChatMessageAPI]] = Field(default_factory=list)
```

### Chat History: `ChatMessageAPI`

```python
class ChatMessageAPI(BaseModel):
    role: str  # "user", "assistant", "system", "human", "ai"
    content: str
```

### Response: `QueryResponse`

```python
class QueryResponse(BaseModel):
    answer: Optional[str] = None
    raw_response: Optional[Any] = None
    error_message: Optional[str] = None
    session_id: str
    model: ModelName
    provider: ModelProvider
    request_timestamp: datetime
    response_timestamp: datetime
    latency_ms: float
```

---

## Model Enums

### ModelName

```python
class ModelName(str, Enum):
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"
    GEMINI_1_5_PRO_LATEST = "gemini-1.5-pro-latest"
    GEMINI_1_5_FLASH_LATEST = "gemini-1.5-flash-latest"
    GEMINI_1_0_PRO = "gemini-1.0-pro"
    LLAMA3_8B_8192 = "llama3-8b-8192"
    LLAMA3_70B_8192 = "llama3-70b-8192"
```

### ModelProvider

```python
class ModelProvider(str, Enum):
    OPENAI = "openai"
    GOOGLE = "google"
    GROQ = "groq"
```

---

## Helper Functions

### `convert_api_history_to_langchain_messages(api_history)`

- Converts a list of `ChatMessageAPI` objects into LangChain message objects (`HumanMessage`, `AIMessage`, `SystemMessage`).
- Used to prepare chat history for LLM chains.

### `execute_single_llm_chat(chain, model_name_enum, request_data, langchain_history)`

- Executes the given LLM chain with the provided question and chat history.
- Returns a `QueryResponse` with the answer, raw response, timestamps, latency, and error info.
- Handles errors and logs them server-side.

---

This file provides a clear reference for all LLM backend endpoints, schemas, and helper functions. If you need more details about model chains or other internals, let me know!
