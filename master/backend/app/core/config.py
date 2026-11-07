import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiMitra"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "krishimitra_super_secret_jwt_key_karnataka_2026_aiml")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # State Boundary Constraint
    STATE: str = "Karnataka"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./krishimitra.db")
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]
    
    # Data paths relative to workspace root
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    DATA_RAW_DIR: str = os.path.join(BASE_DIR, "data", "raw")
    
 # SMS & Alert Configuration
SMS_ENABLED: bool = True
SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "fast2sms")
SMS_API_KEY: str = os.getenv("FAST2SMS_API_KEY", "")
SMS_SENDER_ID: str = "KMITRA"
SMS_TEMPLATE_ID: str = os.getenv("SMS_TEMPLATE_ID", "")
    class Config:
        case_sensitive = True

settings = Settings()
