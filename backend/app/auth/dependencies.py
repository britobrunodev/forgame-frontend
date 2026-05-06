from __future__ import annotations

from collections.abc import AsyncGenerator, Callable
from uuid import UUID

from fastapi import Depends, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.auth.jwt_handler import decode_access_token
from backend.app.auth.rbac import Role
from backend.app.config.project_settings import ProjectSettings
from backend.app.models.user import User
from backend.app.repositories.user_repository import UserRepository

_bearer = HTTPBearer()


async def get_session(request: Request) -> AsyncGenerator[AsyncSession, None]:
    async with request.app.state.session_factory() as session:
        yield session


async def get_settings(request: Request) -> ProjectSettings:
    return request.app.state.settings


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
    session: AsyncSession = Depends(get_session),
    settings: ProjectSettings = Depends(get_settings),
) -> User:
    try:
        payload = decode_access_token(credentials.credentials, settings)
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await UserRepository(session).get_by_id(UUID(user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_roles(*roles: Role) -> Callable:
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        user_roles = {r.role for r in current_user.roles}
        if not any(role in user_roles for role in roles):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

    return _check
