"""
OpenAI Service Module
Encapsulates all logic for OpenAI chat, model selection, and error handling.
"""

from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
import openai

load_dotenv()


def chat_with_model(
    model_name: str,
    messages: List[Dict[str, str]],
    api_key: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Sends a chat request to the OpenAI API and returns the response.

    Args:
        model_name (str): The name of the OpenAI model to use (e.g., 'gpt-5').
        messages (List[Dict[str, str]]): List of message dicts in OpenAI format.
        api_key (Optional[str]): OpenAI API key. If None, loads from environment.
        **kwargs: Additional parameters for OpenAI API.

    Returns:
        Dict[str, Any]: Standardized response dict with answer, usage, and error info.
    """
    if api_key is None:
        api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"error": "OpenAI API key not provided."}
    openai.api_key = api_key

    try:
        # For openai>=1.0.0, use openai.chat.completions.create
        response = openai.chat.completions.create(
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
                # Fallback for older openai SDK versions
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
    api_key = os.getenv("OPENAI_API_KEY")
    model_name = "gpt-5"  # Change as needed
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! What is the capital of France?"}
    ]
    result = chat_with_model(model_name, messages, api_key=api_key)
    print("OpenAI Service Test Result:")
    print(result)

# Example usage:
# messages = [
#     {"role": "system", "content": "You are a helpful assistant."},
#     {"role": "user", "content": "Hello!"}
# ]
# result = chat_with_model("gpt-5", messages)
# print(result)
