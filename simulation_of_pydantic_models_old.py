# from datetime import datetime, timezone
# from typing import List
# import uuid
# import time
# import random

# # Import models from the other file
# from api.pydantic_models import (
#     ModelProvider,
#     ModelName,
#     QueryInputForComparison,
#     QueryResponse,
#     ComparisonResponse
# )

# # --- Simulation of Provider-Specific Services/Endpoints ---
# # In a real FastAPI app, these would be separate endpoint functions
# # or calls to other microservices, likely in their own modules.

# def get_openai_response_from_service(
#     question: str, session_id: str, model_to_use: ModelName = ModelName.GPT_4O_MINI
# ) -> QueryResponse:
#     """Simulates calling an OpenAI-specific service/endpoint."""
#     print(f"SERVICE_CALL: OpenAI service called for model {model_to_use.value} with session {session_id}...")
#     request_time = datetime.now(timezone.utc)
#     # Simulate API call latency
#     simulated_latency_seconds = 0.5 + (random.random() * 0.5) # 0.5 to 1.0 seconds
#     time.sleep(simulated_latency_seconds)
#     response_time = datetime.now(timezone.utc)

#     # Dummy answer
#     answer = f"OpenAI ({model_to_use.value}) response to: '{question}' - The advancements include better reasoning and multimodal capabilities."

#     return QueryResponse(
#         answer=answer,
#         session_id=session_id,
#         model=model_to_use,
#         provider=model_to_use.get_provider(), # Derive provider from model
#         request_timestamp=request_time,
#         response_timestamp=response_time,
#         latency_ms=round((response_time - request_time).total_seconds() * 1000, 2)
#     )

# def get_google_response_from_service(
#     question: str, session_id: str, model_to_use: ModelName = ModelName.GEMINI_1_5_FLASH_LATEST
# ) -> QueryResponse:
#     """Simulates calling a Google-specific service/endpoint."""
#     print(f"SERVICE_CALL: Google service called for model {model_to_use.value} with session {session_id}...")
#     request_time = datetime.now(timezone.utc)
#     # Simulate API call latency
#     simulated_latency_seconds = 0.4 + (random.random() * 0.4) # 0.4 to 0.8 seconds
#     time.sleep(simulated_latency_seconds)
#     response_time = datetime.now(timezone.utc)

#     # Dummy answer
#     answer = f"Google ({model_to_use.value}) response to: '{question}' - Key progress in large context windows and multimodal understanding."

#     return QueryResponse(
#         answer=answer,
#         session_id=session_id,
#         model=model_to_use,
#         provider=model_to_use.get_provider(), # Derive provider from model
#         request_timestamp=request_time,
#         response_timestamp=response_time,
#         latency_ms=round((response_time - request_time).total_seconds() * 1000, 2)
#     )

# # Groq service would exist but is not called in this specific comparison
# def get_groq_response_from_service(
#     question: str, session_id: str, model_to_use: ModelName = ModelName.LLAMA3_8B_8192
# ) -> QueryResponse:
#     """Simulates calling a Groq-specific service/endpoint."""
#     print(f"SERVICE_CALL: Groq service called for model {model_to_use.value} with session {session_id}...")
#     request_time = datetime.now(timezone.utc)
#     simulated_latency_seconds = 0.3 + (random.random() * 0.3)
#     time.sleep(simulated_latency_seconds)
#     response_time = datetime.now(timezone.utc)
#     answer = f"Groq ({model_to_use.value}) response: '{question}' - Speed and open models are key for many applications."
#     return QueryResponse(
#         answer=answer,
#         session_id=session_id,
#         model=model_to_use,
#         provider=model_to_use.get_provider(), # Derive provider from model
#         request_timestamp=request_time,
#         response_timestamp=response_time,
#         latency_ms=round((response_time - request_time).total_seconds() * 1000, 2)
#     )


# # --- "Comparison" Handler Logic ---
# # This would be your FastAPI endpoint function that orchestrates the calls.

# def compare_openai_and_google_handler(
#     input_data: QueryInputForComparison,
#     openai_model_choice: ModelName = ModelName.GPT_4O_MINI,
#     google_model_choice: ModelName = ModelName.GEMINI_1_5_FLASH_LATEST
# ) -> ComparisonResponse:
#     """
#     Handles a request to compare OpenAI and Google models for a given question.
#     """
#     all_responses: List[QueryResponse] = []
#     print(f"HANDLER: Starting comparison for session {input_data.session_id}, question: '{input_data.question}'")

#     # Call OpenAI service
#     try:
#         print(f"HANDLER: Requesting OpenAI model: {openai_model_choice.value}")
#         openai_resp = get_openai_response_from_service(
#             question=input_data.question,
#             session_id=input_data.session_id, # Pass the shared session_id
#             model_to_use=openai_model_choice
#         )
#         all_responses.append(openai_resp)
#     except Exception as e:
#         print(f"HANDLER_ERROR: Error getting OpenAI response: {e}")
#         # In a real app, you might add an error placeholder to `all_responses`
#         # or raise an exception that the FastAPI framework can handle.

#     # Call Google service
#     try:
#         print(f"HANDLER: Requesting Google model: {google_model_choice.value}")
#         google_resp = get_google_response_from_service(
#             question=input_data.question,
#             session_id=input_data.session_id, # Pass the shared session_id
#             model_to_use=google_model_choice
#         )
#         all_responses.append(google_resp)
#     except Exception as e:
#         print(f"HANDLER_ERROR: Error getting Google response: {e}")

#     comparison_result = ComparisonResponse(
#         original_question=input_data.question,
#         session_id=input_data.session_id,
#         responses=all_responses,
#     )
#     print(f"HANDLER: Comparison complete for session {input_data.session_id}")
#     return comparison_result


# # --- Main Test Execution ---
# if __name__ == "__main__":
#     # 1. User makes a request to the "comparison" endpoint
#     user_query = QueryInputForComparison(
#         question="What are the ethical considerations of advanced AI?"
#     )
#     print(f"TEST_MAIN: User Query for Comparison: {user_query.model_dump_json(indent=2)}\n")

#     # 2. The comparison handler processes the request
#     # We can specify which exact models from OpenAI and Google to use for this comparison
#     comparison_result_data = compare_openai_and_google_handler(
#         input_data=user_query,
#         openai_model_choice=ModelName.GPT_4O,
#         google_model_choice=ModelName.GEMINI_1_5_PRO_LATEST
#     )

#     # 3. The result is a ComparisonResponse
#     print("\n--- Side-by-Side Comparison Result (OpenAI & Google) ---")
#     print(comparison_result_data.model_dump_json(indent=2))

#     print("\n" + "="*50 + "\n")

#     # Another example with default models
#     user_query_2 = QueryInputForComparison(
#         question="How can AI help in climate change mitigation?"
#     )
#     print(f"TEST_MAIN: User Query 2 for Comparison: {user_query_2.model_dump_json(indent=2)}\n")

#     comparison_result_data_2 = compare_openai_and_google_handler(
#         input_data=user_query_2
#         # openai_model_choice defaults to GPT_4O_MINI
#         # google_model_choice defaults to GEMINI_1_5_FLASH_LATEST
#     )
#     print("\n--- Side-by-Side Comparison Result 2 (Defaults) ---")
#     print(comparison_result_data_2.model_dump_json(indent=2))


#     # Example showing Groq model is available (though not in the above comparison)
#     print("\n" + "="*50 + "\n")
#     print("TEST_MAIN: Demonstrating individual Groq model call (not part of comparison handler)")
#     groq_test_query = QueryInputForComparison(question="Tell me about large language models on Groq.")
#     # Directly call the simulated Groq service for this test
#     groq_single_response = get_groq_response_from_service(
#         question=groq_test_query.question,
#         session_id=groq_test_query.session_id,
#         model_to_use=ModelName.LLAMA3_70B_8192
#     )
#     print("\n--- Single Groq Model Response (Test) ---")
#     print(groq_single_response.model_dump_json(indent=2))