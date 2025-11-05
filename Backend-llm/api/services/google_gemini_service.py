"""
Google Gemini Service Module
Encapsulates all logic for Google Gemini chat, model selection, and error handling.
"""

from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()


def chat_with_model(
    model_name: str,
    messages: List[Dict[str, str]],
    api_key: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Sends a chat request to the Google Gemini API and returns the response.

    Args:
        model_name (str): The name of the Gemini model to use (e.g., 'gemini-2.5-pro').
        messages (List[Dict[str, str]]): List of message dicts in Gemini format.
        api_key (Optional[str]): Gemini API key. If None, loads from environment.
        **kwargs: Additional parameters for Gemini API.

    Returns:
        Dict[str, Any]: Standardized response dict with answer, usage, and error info.
    """
    if api_key is None:
        api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"error": "Google Gemini API key not provided."}

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        # Gemini expects a list of content blocks (dicts with 'role' and 'parts')
        # Convert OpenAI-style messages to Gemini format
        gemini_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            gemini_messages.append({"role": role, "parts": [content]})
        response = model.generate_content(gemini_messages, **kwargs)
        answer = response.text if hasattr(response, "text") else ""

        # Extract serializable raw response data
        raw_data = None
        usage_dict = None
        if hasattr(response, 'candidates') and response.candidates:
            raw_data = {
                'candidates': [
                    {
                        'content': {
                            'parts': [{'text': part.text} for part in candidate.content.parts if hasattr(part, 'text')],
                            'role': candidate.content.role if hasattr(candidate.content, 'role') else None,
                        },
                        'finish_reason': candidate.finish_reason if hasattr(candidate, 'finish_reason') else None,
                        'safety_ratings': [
                            {'category': rating.category,
                                'probability': rating.probability}
                            for rating in candidate.safety_ratings
                        ] if hasattr(candidate, 'safety_ratings') else [],
                    }
                    for candidate in response.candidates
                ],
                'usage_metadata': {
                    'prompt_token_count': response.usage_metadata.prompt_token_count,
                    'candidates_token_count': response.usage_metadata.candidates_token_count,
                    'total_token_count': response.usage_metadata.total_token_count,
                } if hasattr(response, 'usage_metadata') else None,
            }

            # Convert usage_metadata to dict for Pydantic V2 serialization
            if hasattr(response, 'usage_metadata'):
                usage_dict = {
                    'prompt_token_count': response.usage_metadata.prompt_token_count,
                    'candidates_token_count': response.usage_metadata.candidates_token_count,
                    'total_token_count': response.usage_metadata.total_token_count,
                }

        return {
            "answer": answer,
            "raw": raw_data,
            "usage": usage_dict,  # Now a dict, not an object
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
    api_key = os.getenv("GOOGLE_API_KEY")
    model_name = "gemini-2.5-pro"  # Change as needed
    messages = [
        {"role": "user", "content": "Hello! What is the capital of France?"}
    ]
    result = chat_with_model(model_name, messages, api_key=api_key)
    print("Google Gemini Service Test Result:")
    print(result)

# Example usage:
# messages = [
#     {"role": "user", "content": "Hello!"}
# ]
# result = chat_with_model("gemini-2.5-pro", messages)
# print(result)
