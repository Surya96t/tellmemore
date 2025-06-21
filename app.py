# frontend/app.py
import os
from frontend_app import create_app
from config import Config, DevelopmentConfig, ProductionConfig # Import config classes

# Determine the configuration class based on environment
config_name = os.environ.get('FLASK_CONFIG', 'development')

if config_name == 'development':
    app = create_app(DevelopmentConfig)
elif config_name == 'production':
    app = create_app(ProductionConfig)
else:
    app = create_app(Config) # Default to base Config

if __name__ == '__main__':
    # Run frontend app on a different port than the backend API
    app.run(debug=True, port=5001)