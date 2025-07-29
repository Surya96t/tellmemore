# test_models.py
import pytest
from datetime import datetime, timezone
import uuid
from pydantic import ValidationError

# Assuming models.py is in the same directory or accessible in PYTHONPATH
# If models.py is in a parent directory/package, adjust the import accordingly
# e.g., from ..models import ModelName, ... or from your_package.models import ...
from ..api.pydantic_models import (
    ModelProvider,
    ModelName,
    QueryInputForComparison,
    QueryResponse,
    ComparisonResponse
)

# --- Test Cases for ModelName ---

def test_model_name_get_provider():
    assert ModelName.GPT_4O.get_provider() == ModelProvider.OPENAI
    assert ModelName.GPT_4O_MINI.get_provider() == ModelProvider.OPENAI
    assert ModelName.GEMINI_1_5_PRO_LATEST.get_provider() == ModelProvider.GOOGLE
    assert ModelName.GEMINI_1_5_FLASH_LATEST.get_provider() == ModelProvider.GOOGLE
    assert ModelName.LLAMA3_8B_8192.get_provider() == ModelProvider.GROQ
    assert ModelName.LLAMA3_70B_8192.get_provider() == ModelProvider.GROQ

# --- Test Cases for QueryInputForComparison ---

def test_query_input_valid():
    question_text = "What is Pydantic?"
    inp = QueryInputForComparison(question=question_text)
    assert inp.question == question_text
    assert isinstance(inp.session_id, str)
    try:
        uuid.UUID(inp.session_id) # Check if it's a valid UUID string
    except ValueError:
        pytest.fail("session_id is not a valid UUID string")

def test_query_input_with_session_id():
    question_text = "Test question"
    custom_session_id = "my-custom-session-123"
    inp = QueryInputForComparison(question=question_text, session_id=custom_session_id)
    assert inp.question == question_text
    assert inp.session_id == custom_session_id

def test_query_input_session_id_is_none():
    question_text = "Test question with None session_id"
    inp = QueryInputForComparison(question=question_text, session_id=None)
    assert inp.question == question_text
    assert isinstance(inp.session_id, str) # Should be auto-generated

def test_query_input_missing_question():
    with pytest.raises(ValidationError) as excinfo:
        QueryInputForComparison() # No question provided
    assert "question" in str(excinfo.value).lower()
    assert "field required" in str(excinfo.value).lower()

def test_query_input_invalid_question_type():
    with pytest.raises(ValidationError):
        QueryInputForComparison(question=123) # Invalid type for question

# --- Test Cases for QueryResponse ---

@pytest.fixture
def sample_timestamps():
    now = datetime.now(timezone.utc)
    return {
        "request": now,
        "response": datetime.fromtimestamp(now.timestamp() + 1, tz=timezone.utc)
    }

@pytest.fixture
def valid_query_response_data(sample_timestamps):
    return {
        "answer": "This is a test answer.",
        "session_id": str(uuid.uuid4()),
        "model": ModelName.GPT_4O_MINI,
        "provider": ModelProvider.OPENAI,
        "request_timestamp": sample_timestamps["request"],
        "response_timestamp": sample_timestamps["response"],
        "latency_ms": 1000.5
    }

def test_query_response_valid(valid_query_response_data):
    resp = QueryResponse(**valid_query_response_data)
    assert resp.answer == valid_query_response_data["answer"]
    assert resp.model == ModelName.GPT_4O_MINI
    assert resp.provider == ModelProvider.OPENAI
    assert resp.latency_ms == 1000.5
    assert resp.request_timestamp.tzinfo == timezone.utc
    assert resp.response_timestamp.tzinfo == timezone.utc

def test_query_response_missing_answer(valid_query_response_data):
    data = valid_query_response_data.copy()
    del data["answer"]
    with pytest.raises(ValidationError):
        QueryResponse(**data)

def test_query_response_invalid_model_type(valid_query_response_data):
    data = valid_query_response_data.copy()
    data["model"] = "not-a-model" # Invalid enum value
    with pytest.raises(ValidationError):
        QueryResponse(**data)

def test_query_response_invalid_latency_type(valid_query_response_data):
    data = valid_query_response_data.copy()
    data["latency_ms"] = "not-a-float"
    with pytest.raises(ValidationError):
        QueryResponse(**data)

def test_query_response_raises_error_for_naive_datetime_input(valid_query_response_data):
    data_with_naive_request  = valid_query_response_data.copy()
    navie_dt = datetime.now()  # Naive datetime
    data_with_naive_request ["request_timestamp"] = navie_dt
    
    with pytest.raises(ValidationError) as excinfo_req:
        QueryResponse(**data_with_naive_request)
    
    # Pydantic v2 will likely coerce this to an aware datetime (often UTC by default)
    # So, we don't expect a ValidationError.

    # Check that our custom error message (or a part of it) is in the Pydantic ValidationError
    assert "datetime must be timezone-aware" in str(excinfo_req.value).lower()
     # You can also check the specific field that failed if needed:
    # assert any(err['type'] == 'value_error' and "timezone-aware" in err['msg'].lower() for err in excinfo_req.value.errors() if err['loc'][0] == 'request_timestamp')

# --- Test Cases for ComparisonResponse ---

@pytest.fixture
def sample_query_response(valid_query_response_data):
    return QueryResponse(**valid_query_response_data)

def test_comparison_response_valid_empty_responses():
    question = "Original question for comparison"
    session_id = str(uuid.uuid4())
    comp_resp = ComparisonResponse(
        original_question=question,
        session_id=session_id,
        responses=[]
    )
    assert comp_resp.original_question == question
    assert comp_resp.session_id == session_id
    assert len(comp_resp.responses) == 0
    assert isinstance(comp_resp.comparison_timestamp, datetime)
    assert comp_resp.comparison_timestamp.tzinfo == timezone.utc

def test_comparison_response_valid_with_responses(sample_query_response):
    question = "Another original question"
    session_id = str(uuid.uuid4())
    comp_resp = ComparisonResponse(
        original_question=question,
        session_id=session_id,
        responses=[sample_query_response, sample_query_response] # List of valid QueryResponse
    )
    assert len(comp_resp.responses) == 2
    assert isinstance(comp_resp.responses[0], QueryResponse)

def test_comparison_response_missing_original_question():
    with pytest.raises(ValidationError):
        ComparisonResponse(session_id=str(uuid.uuid4()), responses=[])

def test_comparison_response_invalid_responses_type(sample_query_response):
    # Test with a list containing a non-QueryResponse item
    with pytest.raises(ValidationError):
        ComparisonResponse(
            original_question="Test",
            session_id=str(uuid.uuid4()),
            responses=[sample_query_response, {"not_a_response": True}]
        )
    # Test with responses not being a list
    with pytest.raises(ValidationError):
        ComparisonResponse(
            original_question="Test",
            session_id=str(uuid.uuid4()),
            responses="not-a-list"
        )

def test_comparison_response_default_timestamp():
    comp_resp = ComparisonResponse(
        original_question="Q",
        session_id="S",
        responses=[]
    )
    assert isinstance(comp_resp.comparison_timestamp, datetime)
    assert comp_resp.comparison_timestamp.tzinfo == timezone.utc
    # Check it's reasonably close to now
    assert (datetime.now(timezone.utc) - comp_resp.comparison_timestamp).total_seconds() < 1