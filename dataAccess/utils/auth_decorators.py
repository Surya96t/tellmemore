# TellMeMore/dataAccess/utils/auth_decorators.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt

def jwt_required_wrapper(fn):
    """
    A wrapper for jwt_required that also handles common JWT errors.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception as e:
            # Handle specific JWT errors if needed, e.g., InvalidTokenError, NoAuthorizationError
            return jsonify({"msg": str(e)}), 401
    return wrapper

def admin_required(fn):
    """
    A decorator to restrict access to admin users.
    Assumes JWT is already validated and identity/claims are available.
    """
    @wraps(fn)
    @jwt_required_wrapper
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

# You can add more decorators here, e.g., for specific roles or permissions