from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from backend.app.config.project_settings import ProjectSettings

_ALGORITHM = "HS256"


def create_access_token(subject: str, settings: ProjectSettings) -> str:
    payload = {
        "sub": subject,
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expire_hours),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=_ALGORITHM)


def decode_access_token(token: str, settings: ProjectSettings) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[_ALGORITHM])
