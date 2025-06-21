# TellMeMore/dataAccess/__init__.py
import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mongoengine import MongoEngine
from dotenv import load_dotenv

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
mongo = MongoEngine()

def create_app(config_class):
    app = Flask(__name__)
    app.config.from_object(config_class)

    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

    app.config.update(
        SQLALCHEMY_DATABASE_URI=os.getenv('postgresql+psycopg2://tmmdbuser:H0odBla$#2025@172.25.36.226:5432/tmmdb', app.config['SQLALCHEMY_DATABASE_URI']),
        MONGO_URI=os.getenv('MONGO_URI', app.config['MONGO_URI']),
        SECRET_KEY=os.getenv('SECRET_KEY', app.config['SECRET_KEY']),
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', app.config['JWT_SECRET_KEY'])
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    mongo.init_app(app)

    # --- NEW ADDITION FOR TABLE CREATION ---
    with app.app_context():
        # Import models here to ensure they are registered with SQLAlchemy's metadata
        from dataAccess.models.postgres_models import User, Quota, ChatSession
        # db.create_all() will create tables only if they do not already exist.
        # It won't modify existing tables or data.
        db.create_all()
        app.logger.info("PostgreSQL tables checked/created.")
    # --- END NEW ADDITION ---

    # Register Blueprints
    from .api.auth import auth_bp
    from .api.users import users_bp
    from .api.chat_sessions import chat_sessions_bp
    from .api.prompts import prompts_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(chat_sessions_bp)
    app.register_blueprint(prompts_bp)

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify(message="Resource not found"), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        app.logger.exception('An internal server error occurred')
        return jsonify(message="Internal server error"), 500

    return app