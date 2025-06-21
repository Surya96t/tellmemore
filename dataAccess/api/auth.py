# TellMeMore/dataAccess/api/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

# Import services
from dataAccess.services.user_service import UserService
from dataAccess.services.audit_service import AuditService
from dataAccess.services.quota_service import QuotaService # For quota related actions

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([name, email, password]):
        return jsonify({'message': 'Missing name, email, or password'}), 400

    if UserService.get_user_by_email(email):
        return jsonify({'message': 'User with this email already exists'}), 409

    try:
        new_user = UserService.create_user(name, email, password, role)
        # Log the registration event
        AuditService.log_event(
            event_type='user_registered',
            user_id=new_user.user_id,
            details={'email': new_user.email, 'role': new_user.role}
        )
        return jsonify({
            'message': 'User registered successfully',
            'user_id': new_user.user_id,
            'email': new_user.email
        }), 201
    except Exception as e:
        # Log the error for internal debugging
        print(f"Error during registration: {e}")
        return jsonify({'message': 'Internal server error during registration'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Missing email or password'}), 400

    user = UserService.get_user_by_email(email)
    if not user or not UserService.verify_password(user, password):
        AuditService.log_event(
            event_type='login_failed',
            details={'email_attempt': email, 'reason': 'Invalid credentials'}
        )
        return jsonify({'message': 'Invalid credentials'}), 401

    # You can add custom claims to the JWT (e.g., user role)
    additional_claims = {"role": user.role, "email": user.email}
    access_token = create_access_token(
        identity=user.user_id,
        expires_delta=timedelta(hours=1),
        additional_claims=additional_claims
    )
    AuditService.log_event(
        event_type='user_logged_in',
        user_id=user.user_id,
        details={'email': user.email}
    )
    return jsonify(access_token=access_token), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required() # Protect this route
def get_current_user():
    current_user_id = get_jwt_identity()
    user = UserService.get_user_by_id(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

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

# Optional: Logout (JWTs are stateless, so logout is client-side removal of token)
# But you can implement token blocklisting for revoke functionality
# @auth_bp.route('/logout', methods=['POST'])
# @jwt_required()
# def logout():
#     jti = get_jwt()['jti']
#     # Add jti to a blocklist (e.g., Redis or database)
#     return jsonify({'message': 'Successfully logged out'}), 200