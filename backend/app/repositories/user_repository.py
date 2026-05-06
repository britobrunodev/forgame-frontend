from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.database.base_repository import BaseRepository
from backend.app.models.user import User, UserRole


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    async def get_by_id(self, id: UUID) -> User | None:
        result = await self._session.execute(
            select(User).where(User.id == id).options(selectinload(User.roles))
        )
        return result.scalar_one_or_none()

    async def get_by_google_id(self, google_id: str) -> User | None:
        result = await self._session.execute(
            select(User)
            .where(User.google_id == google_id)
            .options(selectinload(User.roles))
        )
        return result.scalar_one_or_none()

    async def add_role(
        self, user_id: UUID, role: str, granted_by_id: UUID | None = None
    ) -> UserRole:
        user_role = UserRole(user_id=user_id, role=role, granted_by_id=granted_by_id)
        self._session.add(user_role)
        await self._session.commit()
        return user_role

    async def remove_role(self, user_id: UUID, role: str) -> bool:
        instance = await self._session.get(UserRole, (user_id, role))
        if instance is None:
            return False
        await self._session.delete(instance)
        await self._session.commit()
        return True
