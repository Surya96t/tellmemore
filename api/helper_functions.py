
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
        answer_text = await chain.ainvoke({
            "input": request_data.question,
            "chat_history": langchain_history
        })
        response_time = datetime.now(timezone.utc)
        latency = (response_time - request_time).total_seconds() * 1000
        return QueryResponse(
            answer=answer_text,
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