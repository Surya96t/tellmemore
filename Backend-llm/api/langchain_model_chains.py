from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import Runnable, RunnableParallel, RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import List, Dict, Any 
from dotenv import load_dotenv
import os
import google.generativeai as genai


load_dotenv()

# Common components for simple chains
# output_parser = StrOutputParser()

chat_llm_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI assistant..."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ]
)

output_structure_chain = RunnableParallel(
    raw=RunnablePassthrough(),
    answer=StrOutputParser()
)


def get_openai_llm_chain(model_name: str) -> Runnable:
    """
    Creates a LangChain LCEL chain for an OpenAI model with chat history support.

    Args:
        model_name (str): The name of the OpenAI model to use.

    Returns:
        Runnable: A LangChain runnable chain.
                  The chain expects a dictionary with "input" (str) and
                  "chat_history" (List[BaseMessage]) keys.
                  "chat_history" can be an empty list for the first turn.
    """
    llm = ChatOpenAI(model=model_name, api_key=os.getenv("OPENAI_API_KEY"))
    chain = chat_llm_prompt | llm | output_structure_chain
    return chain

def get_google_llm_chain(model_name: str) -> Runnable:
    """
    Creates a LangChain LCEL chain for a Google (Gemini) model with chat history support.

    Args:
        model_name (str): The name of the Google model to use.

    Returns:
        Runnable: A LangChain runnable chain.
                  The chain expects a dictionary with "input" (str) and
                  "chat_history" (List[BaseMessage]) keys.
                  "chat_history" can be an empty list for the first turn.
    """
    llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=os.getenv("GOOGLE_API_KEY"))
    chain = chat_llm_prompt | llm | output_structure_chain
    return chain

def get_groq_llm_chain(model_name: str) -> Runnable:
    """
    Creates a LangChain LCEL chain for a Groq model with chat history support.

    Args:
        model_name (str): The name of the Groq model to use.

    Returns:
        Runnable: A LangChain runnable chain.
                  The chain expects a dictionary with "input" (str) and
                  "chat_history" (List[BaseMessage]) keys.
                  "chat_history" can be an empty list for the first turn.
    """
    llm = ChatGroq(model=model_name, groq_api_key=os.getenv("GROQ_API_KEY")) # Groq uses model_name parameter
    chain = chat_llm_prompt | llm | output_structure_chain
    return chain


# if __name__ == '__main__':
#     # Ensure your API keys are set in your environment.

#     # --- Using string literals for model names (or your ModelName enum if available) ---
#     openai_model_str = "gpt-4o-mini"
#     google_model_str = "gemini-1.5-flash-latest"
#     groq_model_str = "llama3-8b-8192"

#     # Initialize chains
#     openai_chain = get_openai_llm_chain(model_name=openai_model_str)
#     google_chain = get_google_llm_chain(model_name=google_model_str)
#     groq_chain = get_groq_llm_chain(model_name=groq_model_str)

#     # --- Example Conversation with OpenAI ---
#     print(f"--- Testing Chat with OpenAI ({openai_model_str}) ---")
#     chat_history_openai: List[Any] = [] # Use List[Any] or List[BaseMessage]

#     # Turn 1
#     user_input_1 = "My name is Bob. What is the color of the sky during a clear day?"
#     print(f"User: {user_input_1}")
#     try:
#         response_1 = openai_chain.invoke({
#             "chat_history": chat_history_openai,
#             "input": user_input_1,
#         })
#         print(f"OpenAI: {response_1}")
#         chat_history_openai.append(HumanMessage(content=user_input_1))
#         chat_history_openai.append(AIMessage(content=response_1))
#     except Exception as e:
#         print(f"Error with OpenAI: {e}")

#     # Turn 2 (with history)
#     user_input_2 = "What is my name?"
#     print(f"\nUser: {user_input_2}")
#     if chat_history_openai: # Only try if previous turn was successful
#         try:
#             response_2 = openai_chain.invoke({
#                 "chat_history": chat_history_openai,
#                 "input": user_input_2
#             })
#             print(f"OpenAI: {response_2}")
#             chat_history_openai.append(HumanMessage(content=user_input_2))
#             chat_history_openai.append(response_2)
#         except Exception as e:
#             print(f"Error with OpenAI: {e}")
#     print("-" * 30)

#     # --- Example Conversation with Google ---
#     print(f"\n--- Testing Chat with Google ({google_model_str}) ---")
#     chat_history_google: List[Any] = []

#     # Turn 1
#     user_input_g1 = "What is the capital of Germany?"
#     print(f"User: {user_input_g1}")
#     try:
#         response_g1 = google_chain.invoke({
#             "input": user_input_g1,
#             "chat_history": chat_history_google
#         })
#         print(f"Google: {response_g1}")
#         chat_history_google.append(HumanMessage(content=user_input_g1))
#         chat_history_google.append(AIMessage(content=response_g1))
#     except Exception as e:
#         print(f"Error with Google: {e}")

#     # Turn 2 (with history)
#     user_input_g2 = "And what is its primary spoken language?"
#     print(f"\nUser: {user_input_g2}")
#     if chat_history_google:
#         try:
#             response_g2 = google_chain.invoke({
#                 "input": user_input_g2,
#                 "chat_history": chat_history_google
#             })
#             print(f"Google: {response_g2}")
#             chat_history_google.append(HumanMessage(content=user_input_g2))
#             chat_history_google.append(AIMessage(content=response_g2))
#         except Exception as e:
#             print(f"Error with Google: {e}")
#     print("-" * 30)

#     # --- Example Conversation with Groq ---
#     # Note: LLaMA models might not be as strong at remembering names or conversational context
#     # without very specific prompting or fine-tuning, but the mechanism is the same.
#     print(f"\n--- Testing Chat with Groq ({groq_model_str}) ---")
#     chat_history_groq: List[Any] = []

#     # Turn 1
#     user_input_gr1 = "I like the color blue. What are two common fruits that are blue?"
#     print(f"User: {user_input_gr1}")
#     try:
#         response_gr1 = groq_chain.invoke({
#             "input": user_input_gr1,
#             "chat_history": chat_history_groq
#         })
#         print(f"Groq: {response_gr1}")
#         chat_history_groq.append(HumanMessage(content=user_input_gr1))
#         chat_history_groq.append(AIMessage(content=response_gr1))
#     except Exception as e:
#         print(f"Error with Groq: {e}")

#     # Turn 2 (with history)
#     user_input_gr2 = "What was the color I said I liked?"
#     print(f"\nUser: {user_input_gr2}")
#     if chat_history_groq:
#         try:
#             response_gr2 = groq_chain.invoke({
#                 "input": user_input_gr2,
#                 "chat_history": chat_history_groq
#             })
#             print(f"Groq: {response_gr2}")
#             # Not adding to history here for brevity in example
#         except Exception as e:
#             print(f"Error with Groq: {e}")
#     print("-" * 30)