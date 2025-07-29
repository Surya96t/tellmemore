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
        