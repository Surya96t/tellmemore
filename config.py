# frontend/config.py
from datetime import timedelta
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'f7bd3a1f57a9ce1e2bc3e054fe8ansgdjhjuhsfh2e95a3011c02eoihc49aa3b4936ef7133b8ff7')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'fmjfdyhf57a9ce1e2bc3hsfdghjfhfhghe054fe8a2e95a3011c02eec49aa3b4936ef7133b8ff7')
    # This is the URL for the *backend* dataAccess API
    DATA_ACCESS_API_URL = os.environ.get('DATA_ACCESS_API_URL', 'http://127.0.0.1:5000/api/v1')

    # --- ADD/CONFIRM THESE SESSION CONFIGS ---
    SESSION_COOKIE_SAMESITE = 'Lax' # Recommended for modern browsers to prevent CSRF
    SESSION_COOKIE_SECURE = False # Set to True in production if using HTTPS
    SESSION_PERMANENT = True # Make sessions permanent (stored in cookie)
    PERMANENT_SESSION_LIFETIME = timedelta(days=31) # e.g., 31 days
    # --- END ADD/CONFIRM ---

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    # Ensure DATA_ACCESS_API_URL and SECRET_KEY are set in production environment variables