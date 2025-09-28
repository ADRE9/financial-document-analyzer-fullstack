from pydantic_settings import BaseSettings
from typing import Optional, List
import json


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Application settings
    app_name: str = "Financial Document Analyzer API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Security settings
    secret_key: str = "your-secret-key-change-in-production-please-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    
    # MongoDB Database settings
    mongodb_host: str = "localhost"
    mongodb_port: int = 27017
    mongodb_user: Optional[str] = None
    mongodb_password: Optional[str] = None
    mongodb_db: str = "financial_docs"
    mongodb_url: Optional[str] = None
    
    # CORS settings - for development, allow all localhost ports
    allowed_origins: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:5174"
    ]
    
    @property
    def database_url(self) -> str:
        """Generate MongoDB connection URL from individual components."""
        if self.mongodb_url:
            return self.mongodb_url
        
        # Build MongoDB URL
        if self.mongodb_user and self.mongodb_password:
            return f"mongodb://{self.mongodb_user}:{self.mongodb_password}@{self.mongodb_host}:{self.mongodb_port}/{self.mongodb_db}"
        else:
            return f"mongodb://{self.mongodb_host}:{self.mongodb_port}/{self.mongodb_db}"
    
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
