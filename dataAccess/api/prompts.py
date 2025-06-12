# TellMeMore/dataAccess/api/prompts.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

# Import services and decorators
from dataAccess.services.prompt_service import PromptService
# UPDATED: Import ChatSessionService
from dataAccess.services.chat_session_service import ChatSessionService
from dataAccess.services.quota_service import QuotaService
from dataAccess.services.audit_service import AuditService
from dataAccess.utils.auth_decorators import jwt_required_wrapper

prompts_bp = Blueprint('prompts', __name__, url_prefix='/api/v1/prompts')

@prompts_bp.route('/', methods=['POST'])
@jwt_required_wrapper
def create_prompt():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    chat_session_id = data.get('chat_session_id') # UPDATED: Parameter name
    prompt_text = data.get('prompt_text')
    response_text = data.get('response_text')

    if not all([chat_session_id, prompt_text]): # UPDATED: Parameter name
        return jsonify({'message': 'chat_session_id and prompt_text are required'}), 400

    # 1. Verify chat session ownership
    chat_session = ChatSessionService.get_chat_session_by_id(chat_session_id) # UPDATED: Service call
    if not chat_session or chat_session.user_id != current_user_id:
        return jsonify({'message': 'Chat session not found or unauthorized'}), 403

    # 2. Check and increment quota
    quota_available = QuotaService.increment_quota_usage(current_user_id)
    if not quota_available:
        AuditService.log_event(
            event_type='quota_exceeded',
            user_id=current_user_id,
            chat_session_id=chat_session_id, # UPDATED
            details={'prompt_text_start': prompt_text[:50]}
        )
        return jsonify({'message': 'Daily prompt quota exceeded'}), 429

    # 3. Create prompt
    try:
        new_prompt = PromptService.create_prompt(
            chat_session_id=chat_session_id, # UPDATED: parameter
            user_id=current_user_id,
            prompt_text=prompt_text,
            response_text=response_text
        )
        AuditService.log_event(
            event_type='prompt_created',
            user_id=current_user_id,
            chat_session_id=chat_session_id, # UPDATED
            details={'prompt_id': str(new_prompt.id), 'prompt_length': len(prompt_text)}
        )
        return jsonify(new_prompt.to_dict()), 201
    except Exception as e:
        print(f"Error creating prompt: {e}")
        AuditService.log_event(
            event_type='prompt_creation_failed',
            user_id=current_user_id,
            chat_session_id=chat_session_id, # UPDATED
            details={'error': str(e), 'prompt_text_start': prompt_text[:50]}
        )
        return jsonify({'message': 'Internal server error creating prompt'}), 500


@prompts_bp.route('/<string:prompt_id>', methods=['GET'])
@jwt_required_wrapper
def get_prompt(prompt_id):
    current_user_id = get_jwt_identity()
    prompt = PromptService.get_prompt_by_id(prompt_id)

    if not prompt:
        return jsonify({'message': 'Prompt not found'}), 404

    if prompt.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized to access this prompt'}), 403

    return jsonify(prompt.to_dict()), 200


@prompts_bp.route('/chat-session/<string:chat_session_id>', methods=['GET']) # UPDATED: URL path and parameter
@jwt_required_wrapper
def get_prompts_by_chat_session(chat_session_id): # RENAMED: Function name and parameter
    current_user_id = get_jwt_identity()
    # First, verify chat session ownership
    chat_session = ChatSessionService.get_chat_session_by_id(chat_session_id) # UPDATED: Service call
    if not chat_session or chat_session.user_id != current_user_id:
        return jsonify({'message': 'Chat session not found or unauthorized'}), 403

    prompts = PromptService.get_prompts_for_chat_session(chat_session_id) # UPDATED: Service call
    prompts_list = [p.to_dict() for p in prompts]
    return jsonify(prompts_list), 200