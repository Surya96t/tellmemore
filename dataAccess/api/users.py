# TellMeMore/dataAccess/api/users.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

# Import services and decorators
from dataAccess.services.user_service import UserService
from dataAccess.services.quota_service import QuotaService
from dataAccess.services.audit_service import AuditService
from dataAccess.utils.auth_decorators import jwt_required_wrapper, admin_required

users_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

# Get a specific user's profile (can be protected for self-access or admin access)
@users_bp.route('/<string:user_id>', methods=['GET'])
@jwt_required_wrapper
def get_user_profile(user_id):
    current_user_id = get_jwt_identity()
    user = UserService.get_user_by_id(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Allow users to view their own profile, or admins to view any profile
    if user_id != current_user_id and get_jwt().get('role') != 'admin':
        return jsonify({'message': 'Unauthorized to view this user profile'}), 403

    # Fetch quota details
    quota = QuotaService.get_user_quota(user.user_id)
    quota_info = {
        'daily_limit': quota.daily_limit,
        'used_today': quota.used_today,
        'last_reset': quota.last_reset.isoformat() if quota.last_reset else None
    } if quota else {}

    return jsonify({
        'user_id': user.user_id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat(),
        'quota': quota_info
    }), 200

# Update a user's profile (can be protected for self-access or admin access)
@users_bp.route('/<string:user_id>', methods=['PUT'])
@jwt_required_wrapper
def update_user_profile(user_id):
    current_user_id = get_jwt_identity()
    user_role = get_jwt().get('role')

    # Users can only update their own profile, unless they are admin
    if user_id != current_user_id and user_role != 'admin':
        return jsonify({'message': 'Unauthorized to update this user profile'}), 403

    data = request.get_json()
    # Only allow certain fields to be updated by non-admins for security
    allowed_fields = ['name']
    if user_role == 'admin':
        allowed_fields.extend(['email', 'password', 'role', 'daily_limit']) # Admin can update more

    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    if 'daily_limit' in update_data and user_role == 'admin':
        QuotaService.set_daily_limit(user_id, update_data.pop('daily_limit'))
        AuditService.log_event(
            event_type='quota_limit_updated',
            user_id=current_user_id, # Admin who made the change
            details={'target_user_id': user_id, 'new_limit': update_data['daily_limit']}
        )

    updated_user = UserService.update_user(user_id, **update_data)

    if not updated_user:
        return jsonify({'message': 'User not found or update failed'}), 404

    AuditService.log_event(
        event_type='user_profile_updated',
        user_id=current_user_id,
        details={'target_user_id': user_id, 'updated_fields': list(update_data.keys())}
    )
    return jsonify({
        'message': 'User profile updated successfully',
        'user_id': updated_user.user_id,
        'name': updated_user.name,
        'email': updated_user.email
    }), 200

# Delete a user (Admin only)
@users_bp.route('/<string:user_id>', methods=['DELETE'])
@admin_required # Use the custom admin decorator
def delete_user(user_id):
    current_user_id = get_jwt_identity() # The admin performing the delete

    if user_id == current_user_id:
        return jsonify({'message': 'Cannot delete your own account via this endpoint'}), 400

    success = UserService.delete_user(user_id)
    if not success:
        return jsonify({'message': 'User not found or delete failed'}), 404

    AuditService.log_event(
        event_type='user_deleted',
        user_id=current_user_id,
        details={'deleted_user_id': user_id}
    )
    return jsonify({'message': 'User deleted successfully'}), 200

# Get all users (Admin only)
@users_bp.route('/', methods=['GET'])
@admin_required
def get_all_users():
    users = UserService.query.all() # Assuming UserService might need a method to get all users
    # For now, let's add a quick method to UserService
    # Or, preferably, iterate over User.query.all() and convert to dict
    all_users_data = []
    for user in UserService.query.all(): # This line will need a get_all_users method in UserService
        all_users_data.append({
            'user_id': user.user_id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat()
        })
    return jsonify(all_users_data), 200

# Note: Add `get_all_users` method to `UserService`
# In `dataAccess/services/user_service.py`:
# @staticmethod
# def get_all_users():
#     return User.query.all()