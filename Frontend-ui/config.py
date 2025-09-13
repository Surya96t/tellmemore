# config.py

import os
from pydantic_settings import BaseSettings, SettingsConfigDict # Import SettingsConfigDict

class Settings(BaseSettings):
    # Only load .env file if we're not in production (when certain env vars are not set)
    # This prioritizes Cloud Run environment variables over local .env file
    model_config = SettingsConfigDict(
        env_file='.env' if not os.getenv('BACKEND_API_URL') else None, 
        extra='ignore'
    )

    FRONTEND_PORT: int = 8080
    BACKEND_API_URL: str = "https://backend-da-301474384730.us-east4.run.app/api/v1"  # Production default
    # New setting for the LLM API base URL
    LLM_API_BASE_URL: str = "https://backend-llm-301474384730.us-east4.run.app"  # Production default    

settings = Settings()

print(f"DEBUG (frontend config.py): BACKEND_API_URL loaded: {settings.BACKEND_API_URL}")
print(f"DEBUG (frontend config.py): LLM_API_BASE_URL loaded: {settings.LLM_API_BASE_URL}")
print(f"DEBUG (frontend config.py): Environment BACKEND_API_URL: {os.getenv('BACKEND_API_URL', 'NOT SET')}")
print(f"DEBUG (frontend config.py): Environment LLM_API_BASE_URL: {os.getenv('LLM_API_BASE_URL', 'NOT SET')}")