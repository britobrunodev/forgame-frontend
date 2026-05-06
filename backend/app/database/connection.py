from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from backend.app.config.project_settings import ProjectSettings


def create_engine(settings: ProjectSettings) -> AsyncEngine:
    return create_async_engine(settings.database_url, echo=settings.db_echo)


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
