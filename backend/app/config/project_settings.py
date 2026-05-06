from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass(frozen=True, slots=True)
class ProjectSettings:
    app_title: str = "iScalar Joga Junto 360"
    log_level: str = "INFO"
    api_version: str = "v1"
    api_prefix: str = "api"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = False
    database_url: str = "postgresql+asyncpg://admin:admin@localhost/joga_junto_360"
    db_echo: bool = False
    jwt_secret: str = "change-me-in-production"
    jwt_expire_hours: int = 24
    google_client_id: str = ""
    public_url: str = "http://localhost:8000"
    uploads_dir: str = "uploads"

    @classmethod
    def from_env(cls) -> "ProjectSettings":
        load_dotenv(override=True)
        defaults = cls()
        return cls(
            app_title=os.getenv("API_PROJECT_NAME", defaults.app_title),
            log_level=os.getenv("LOG_LEVEL", defaults.log_level),
            api_version=os.getenv("API_VERSION", defaults.api_version),
            api_prefix=os.getenv("API_PREFIX", defaults.api_prefix),
            api_host=os.getenv("API_HOST", defaults.api_host),
            api_port=int(os.getenv("API_PORT", str(defaults.api_port))),
            api_reload=os.getenv("API_RELOAD", "false").lower() == "true",
            database_url=os.getenv("DATABASE_URL", defaults.database_url),
            db_echo=os.getenv("DB_ECHO", "false").lower() == "true",
            jwt_secret=os.getenv("JWT_SECRET", defaults.jwt_secret),
            jwt_expire_hours=int(os.getenv("JWT_EXPIRE_HOURS", str(defaults.jwt_expire_hours))),
            google_client_id=os.getenv("GOOGLE_CLIENT_ID", defaults.google_client_id),
            public_url=os.getenv("PUBLIC_URL", defaults.public_url),
            uploads_dir=os.getenv("UPLOADS_DIR", defaults.uploads_dir),
        )
