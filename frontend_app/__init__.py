# TellMeMore_Frontend/frontend_app/__init__.py
import os
from flask import Flask
from dotenv import load_dotenv
from flask.sessions import SecureCookieSessionInterface # Explicitly import
from datetime import timedelta # Import timedelta if not already there

def create_app(config_class):
    app = Flask(__name__,
                template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
                static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    app.config.from_object(config_class)

    # Load environment variables from .env file (expected in the parent directory: TellMeMore_Frontend/)
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

    # Override config with values from environment variables if they exist
    # Ensure SECRET_KEY is given priority from environment
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', app.config.get('SECRET_KEY', 'f7bd3a1f57a9ce1e2bc3e054fe8ansgdjhjuhsfh2e95a3011c02eoihc49aa3b4936ef7133b8ff7'))
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config.get('JWT_SECRET_KEY', 'fmjfdyhf57a9ce1e2bc3hsfdghjfhfhghe054fe8a2e95a3011c02eec49aa3b4936ef7133b8ff7'))
    app.config['DATA_ACCESS_API_URL'] = os.getenv('DATA_ACCESS_API_URL', app.config['DATA_ACCESS_API_URL'])

    # Ensure SESSION_PERMANENT is explicitly set, even if also in config.py
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=31) # Or whatever duration

    # Register frontend routes blueprint
    from .routes import frontend_bp
    app.register_blueprint(frontend_bp)

    # Optional but good for clarity: Set the session interface
    # This is Flask's default, but explicit confirmation can help debug obscure issues.
    app.session_interface = SecureCookieSessionInterface()
    
    # Debugging: Log the SECRET_KEY being used
    print(f"DEBUG: Frontend Flask app using SECRET_KEY: {app.config['SECRET_KEY'][:10]}...") # Log first 10 chars
    print(f"DEBUG: SESSION_PERMANENT: {app.config['SESSION_PERMANENT']}")

    return app