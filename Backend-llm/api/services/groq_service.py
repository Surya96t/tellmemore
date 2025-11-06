"""
Groq Service Module
Encapsulates all logic for Groq chat, model selection, and error handling.
"""

from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

try:
    import groq
except ImportError:
    groq = None  # Will raise error if used without install


load_dotenv()


def chat_with_model(
    model_name: str,
    messages: List[Dict[str, str]],
    api_key: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Sends a chat request to the Groq API and returns the response.

    Args:
        model_name (str): The name of the Groq model to use (e.g., 'llama-3.1-8b-instant').
        messages (List[Dict[str, str]]): List of message dicts in OpenAI format.
        api_key (Optional[str]): Groq API key. If None, loads from environment.
        **kwargs: Additional parameters for Groq API.

    Returns:
        Dict[str, Any]: Standardized response dict with answer, usage, and error info.
    """
    if groq is None:
        return {"error": "Groq SDK not installed. Please install the 'groq' package."}
    if api_key is None:
        api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"error": "Groq API key not provided."}

    try:
        client = groq.Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            **kwargs
        )
        answer = response.choices[0].message.content if response.choices else ""

        # Convert usage to dict if it exists (for Pydantic V2 serialization)
        usage_obj = getattr(response, "usage", None)
        usage_dict = None
        if usage_obj:
            try:
                usage_dict = usage_obj.model_dump()
            except AttributeError:
                # Fallback for older Groq SDK versions
                usage_dict = {
                    "prompt_tokens": getattr(usage_obj, "prompt_tokens", 0),
                    "completion_tokens": getattr(usage_obj, "completion_tokens", 0),
                    "total_tokens": getattr(usage_obj, "total_tokens", 0),
                }

        return {
            "answer": answer,
            "raw": response.model_dump() if hasattr(response, "model_dump") else response,
            "usage": usage_dict,
            "error": None
        }
    except Exception as e:
        return {
            "answer": None,
            "raw": None,
            "usage": None,
            "error": str(e)
        }


if __name__ == "__main__":
    api_key = os.getenv("GROQ_API_KEY")
    model_name = "llama-3.1-8b-instant"  # Change as needed
    messages = [
        {"role": "user", "content": "Hello! What is the capital of France?"}
    ]
    result = chat_with_model(model_name, messages, api_key=api_key)
    print("Groq Service Test Result:")
    print(result)

# Example usage:
# messages = [
#     {"role": "user", "content": "Hello!"}
# ]
# result = chat_with_model("llama-3.1-8b-instant", messages)
# print(result)
