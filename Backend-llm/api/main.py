# Backend-llm/api/main.py
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Body, Path
from fastapi.middleware.cors import CORSMiddleware
import os

from api.pydantic_models import QueryResponse, ModelName, SingleModelChatRequest, ModelProvider
from api.services.openai_service import chat_with_model as openai_chat_with_model
from api.services.google_gemini_service import chat_with_model as google_chat_with_model
from api.services.groq_service import chat_with_model as groq_chat_with_model

app = FastAPI(
    title="TellMeMore LLM Models API",
    description="API with separate endpoints for querying different LLM providers with chat history support.",
    version="0.1",
)

# --- CORS Configuration ---
origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080,https://frontend-ui-301474384730.us-east4.run.app").split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OpenAI Endpoint ---


@app.post("/chat/openai/{model_name}", response_model=QueryResponse, tags=["OpenAI Chat"])
async def chat_with_openai_model(
    model_name: ModelName = Path(
        ..., description="The OpenAI model to use for the chat. Supported: gpt-4o, gpt-4-turbo, gpt-3.5-turbo"),
    request_body: SingleModelChatRequest = Body(...)
):
    if model_name.get_provider() != ModelProvider.OPENAI:
        raise HTTPException(
            status_code=400,
            detail=f"Model {model_name.value} is not an OpenAI model."
        )

    # Build messages array: system_prompts + chat_history + current question
    messages = request_body.chat_history or []

    # Prepend system prompts if provided
    if request_body.system_prompts:
        for prompt in request_body.system_prompts:
            messages.insert(0, {"role": "system", "content": prompt})

    messages.append({"role": "user", "content": request_body.question})

    request_time = datetime.now(timezone.utc)
    result = openai_chat_with_model(
        model_name.value, messages, **request_body.extra_params if hasattr(request_body, 'extra_params') else {})
    response_time = datetime.now(timezone.utc)
    latency = (response_time - request_time).total_seconds() * 1000
    return QueryResponse(
        answer=result.get("answer"),
        raw_response=result.get("raw"),
        session_id=request_body.session_id,
        model=model_name,
        provider=model_name.get_provider(),
        error_message=result.get("error"),
        request_timestamp=request_time,
        response_timestamp=response_time,
        latency_ms=latency,
        usage=result.get("usage"),  # Include token usage
    )
# --- Google Endpoint ---


@app.post("/chat/google/{model_name_path}", response_model=QueryResponse, tags=["Google Chat"])
async def chat_with_google_model(
    model_name_path: ModelName = Path(
        ..., description="The specific Google Gemini model name to use. Supported: gemini-1.5-pro-latest, gemini-1.5-flash-latest"),
    request_body: SingleModelChatRequest = Body(...)
):
    if model_name_path.get_provider() != ModelProvider.GOOGLE:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_name_path.value}' is not a Google model. Supported: gemini-1.5-pro-latest, gemini-1.5-flash-latest."
        )

    # Build messages array: system_prompts + chat_history + current question
    messages = request_body.chat_history or []

    # Prepend system prompts if provided
    if request_body.system_prompts:
        for prompt in request_body.system_prompts:
            messages.insert(0, {"role": "system", "content": prompt})

    messages.append({"role": "user", "content": request_body.question})

    request_time = datetime.now(timezone.utc)
    result = google_chat_with_model(model_name_path.value, messages, **
                                    request_body.extra_params if hasattr(request_body, 'extra_params') else {})
    response_time = datetime.now(timezone.utc)
    latency = (response_time - request_time).total_seconds() * 1000
    return QueryResponse(
        answer=result.get("answer"),
        raw_response=result.get("raw"),
        session_id=request_body.session_id,
        model=model_name_path,
        provider=model_name_path.get_provider(),
        error_message=result.get("error"),
        request_timestamp=request_time,
        response_timestamp=response_time,
        latency_ms=latency,
        usage=result.get("usage"),  # Include token usage
    )
# --- Groq Endpoint ---


@app.post("/chat/groq/{model_name_path}", response_model=QueryResponse, tags=["Groq Chat"])
async def chat_with_groq_model(
    model_name_path: ModelName = Path(
        ..., description="The specific Groq LLaMA3 model name to use. Supported: llama3-8b-8192, llama3-70b-8192"),
    request_body: SingleModelChatRequest = Body(...)
):
    if model_name_path.get_provider() != ModelProvider.GROQ:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_name_path.value}' is not a Groq model. Supported: llama3-8b-8192, llama3-70b-8192."
        )

    # Build messages array: system_prompts + chat_history + current question
    messages = request_body.chat_history or []

    # Prepend system prompts if provided
    if request_body.system_prompts:
        for prompt in request_body.system_prompts:
            messages.insert(0, {"role": "system", "content": prompt})

    messages.append({"role": "user", "content": request_body.question})

    request_time = datetime.now(timezone.utc)
    result = groq_chat_with_model(model_name_path.value, messages, **
                                  request_body.extra_params if hasattr(request_body, 'extra_params') else {})
    response_time = datetime.now(timezone.utc)
    latency = (response_time - request_time).total_seconds() * 1000
    return QueryResponse(
        answer=result.get("answer"),
        raw_response=result.get("raw"),
        session_id=request_body.session_id,
        model=model_name_path,
        provider=model_name_path.get_provider(),
        error_message=result.get("error"),
        request_timestamp=request_time,
        response_timestamp=response_time,
        latency_ms=latency,
        usage=result.get("usage"),  # Include token usage
    )
