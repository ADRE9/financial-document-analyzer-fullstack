from pydantic_settings import BaseSettings
from typing import Optional


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
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # PostgreSQL Database settings
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "financial_docs"
    postgres_url: Optional[str] = None
    
    # Redis settings
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: Optional[str] = None
    redis_db: int = 0
    redis_url: Optional[str] = None
    
    # CORS settings
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    @property
    def database_url(self) -> str:
        """Generate PostgreSQL database URL from individual components."""
        if self.postgres_url:
            return self.postgres_url
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    @property
    def redis_connection_url(self) -> str:
        """Generate Redis connection URL from individual components."""
        if self.redis_url:
            return self.redis_url
        auth_part = f":{self.redis_password}@" if self.redis_password else ""
        return f"redis://{auth_part}{self.redis_host}:{self.redis_port}/{self.redis_db}"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
