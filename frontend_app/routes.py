# TellMeMore_Frontend/frontend_app/routes.py
from flask import Blueprint, render_template, redirect, url_for, session, request, current_app, jsonify # Import jsonify
from functools import wraps

frontend_bp = Blueprint('frontend', __name__)

# Decorator to check if user is logged in
def login_required_frontend(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for JWT in Flask session
        if 'jwt_token' not in session:
            # If not logged in, redirect to login page
            return redirect(url_for('frontend.login_page'))
        return f(*args, **kwargs)
    return decorated_function

@frontend_bp.route('/')
@frontend_bp.route('/login')
def login_page():
    if 'jwt_token' in session:
        return redirect(url_for('frontend.dashboard_page'))
    return render_template('auth.html', api_base_url=current_app.config['DATA_ACCESS_API_URL'])

# --- NEW ROUTE FOR HANDLING LOGIN POST-API-CALL ---
@frontend_bp.route('/handle_login', methods=['POST'])
def handle_login():
    data = request.get_json()
    jwt_token = data.get('jwt_token')
    user_id = data.get('user_id') # Optional, if you want to store user_id
    user_email = data.get('user_email') # Optional, if you want to store email
    user_name = data.get('user_name') # Optional, if you want to store name
    user_role = data.get('user_role') # Optional, if you want to store role

    if jwt_token:
        session['jwt_token'] = jwt_token
        session['user_id'] = user_id
        session['user_email'] = user_email
        session['user_name'] = user_name
        session['user_role'] = user_role
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'message': 'No JWT token provided'}), 400
# --- END NEW ROUTE ---

@frontend_bp.route('/dashboard')
@login_required_frontend
def dashboard_page():
    return render_template('dashboard.html', api_base_url=current_app.config['DATA_ACCESS_API_URL'])


@frontend_bp.route('/logout')
def logout_user():
    session.pop('jwt_token', None)
    session.pop('user_id', None)
    session.pop('user_email', None)
    session.pop('user_name', None)
    session.pop('user_role', None)
    return redirect(url_for('frontend.login_page'))