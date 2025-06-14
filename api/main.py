from fastapi import FastAPI, HTTPException, Body, Path
from api.pydantic_models import QueryResponse, ModelName, SingleModelChatRequest, ModelProvider
from .helper_functions import convert_api_history_to_langchain_messages, execute_single_llm_chat
from api.langchain_model_chains import get_openai_llm_chain, get_google_llm_chain, get_groq_llm_chain

# from contextlib import asynccontextmanager


# @asynccontextmanager
# async def lifespan(app: FastAPI):
    


app = FastAPI(
    title="TellMeMore LLM Models API",
    description="API with separate endpoints for querying different LLM providers with chat history support.",
    version="0.1",
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