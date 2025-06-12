# TellMeMore/dataAccess/api/chat_sessions.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

# Import services and decorators
from dataAccess.services.chat_session_service import ChatSessionService # UPDATED: Import ChatSessionService
from dataAccess.services.user_service import UserService
from dataAccess.services.audit_service import AuditService
from dataAccess.utils.auth_decorators import jwt_required_wrapper

# RENAMED: Blueprint name and URL prefix
chat_sessions_bp = Blueprint('chat_sessions', __name__, url_prefix='/api/v1/chat-sessions')

@chat_sessions_bp.route('/', methods=['POST'])
@jwt_required_wrapper
def create_chat_session(): # RENAMED: Function name
    current_user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')

    if not title:
        return jsonify({'message': 'Chat session title is required'}), 400

    try:
        new_chat_session = ChatSessionService.create_chat_session(current_user_id, title) # UPDATED: Service call
        AuditService.log_event(
            event_type='chat_session_created', # UPDATED
            user_id=current_user_id,
            chat_session_id=new_chat_session.chat_session_id, # UPDATED
            details={'title': new_chat_session.title}
        )
        return jsonify({
            'message': 'Chat session created successfully',
            'chat_session_id': new_chat_session.chat_session_id, # UPDATED
            'user_id': new_chat_session.user_id,
            'title': new_chat_session.title,
            'created_at': new_chat_session.created_at.isoformat()
        }), 201
    except Exception as e:
        print(f"Error creating chat session: {e}")
        return jsonify({'message': 'Internal server error creating chat session'}), 500

@chat_sessions_bp.route('/<string:chat_session_id>', methods=['GET']) # UPDATED: Parameter name
@jwt_required_wrapper
def get_chat_session(chat_session_id): # RENAMED: Function name and parameter
    current_user_id = get_jwt_identity()
    chat_session = ChatSessionService.get_chat_session_by_id(chat_session_id) # UPDATED: Service call

    if not chat_session:
        return jsonify({'message': 'Chat session not found'}), 404

    if chat_session.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized to access this chat session'}), 403

    return jsonify({
        'chat_session_id': chat_session.chat_session_id, # UPDATED
        'user_id': chat_session.user_id,
        'title': chat_session.title,
        'created_at': chat_session.created_at.isoformat()
    }), 200

@chat_sessions_bp.route('/', methods=['GET'])
@jwt_required_wrapper
def get_user_chat_sessions(): # RENAMED: Function name
    current_user_id = get_jwt_identity()
    chat_sessions = ChatSessionService.get_chat_sessions_for_user(current_user_id) # UPDATED: Service call

    chat_sessions_list = []
    for chat_session in chat_sessions: # UPDATED
        chat_sessions_list.append({
            'chat_session_id': chat_session.chat_session_id, # UPDATED
            'user_id': chat_session.user_id,
            'title': chat_session.title,
            'created_at': chat_session.created_at.isoformat()
        })
    return jsonify(chat_sessions_list), 200

@chat_sessions_bp.route('/<string:chat_session_id>', methods=['PUT']) # UPDATED: Parameter name
@jwt_required_wrapper
def update_chat_session(chat_session_id): # RENAMED: Function name and parameter
    current_user_id = get_jwt_identity()
    chat_session = ChatSessionService.get_chat_session_by_id(chat_session_id) # UPDATED: Service call

    if not chat_session:
        return jsonify({'message': 'Chat session not found'}), 404

    if chat_session.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized to update this chat session'}), 403

    data = request.get_json()
    title = data.get('title')
    if not title:
        return jsonify({'message': 'Title is required for update'}), 400

    updated_chat_session = ChatSessionService.update_chat_session(chat_session_id, title=title) # UPDATED: Service call
    if not updated_chat_session:
        return jsonify({'message': 'Chat session update failed'}), 500

    AuditService.log_event(
        event_type='chat_session_updated', # UPDATED
        user_id=current_user_id,
        chat_session_id=updated_chat_session.chat_session_id, # UPDATED
        details={'new_title': updated_chat_session.title}
    )
    return jsonify({
        'message': 'Chat session updated successfully',
        'chat_session_id': updated_chat_session.chat_session_id, # UPDATED
        'title': updated_chat_session.title
    }), 200

@chat_sessions_bp.route('/<string:chat_session_id>', methods=['DELETE']) # UPDATED: Parameter name
@jwt_required_wrapper
def delete_chat_session(chat_session_id): # RENAMED: Function name and parameter
    current_user_id = get_jwt_identity()
    chat_session = ChatSessionService.get_chat_session_by_id(chat_session_id) # UPDATED: Service call

    if not chat_session:
        return jsonify({'message': 'Chat session not found'}), 404

    if chat_session.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized to delete this chat session'}), 403

    success = ChatSessionService.delete_chat_session(chat_session_id) # UPDATED: Service call
    if not success:
        return jsonify({'message': 'Chat session deletion failed'}), 500

    AuditService.log_event(
        event_type='chat_session_deleted', # UPDATED
        user_id=current_user_id,
        chat_session_id=chat_session_id, # UPDATED
        details={'title': chat_session.title}
    )
    return jsonify({'message': 'Chat session deleted successfully'}), 200