from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.player_profile import PlayerProfile


class PlayerProfileRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_user_id(self, user_id: UUID) -> PlayerProfile | None:
        result = await self._session.execute(
            select(PlayerProfile).where(PlayerProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def upsert(self, user_id: UUID, **fields) -> PlayerProfile:
        profile = await self.get_by_user_id(user_id)
        if profile is None:
            profile = PlayerProfile(user_id=user_id, **fields)
            self._session.add(profile)
        else:
            for key, value in fields.items():
                setattr(profile, key, value)
        await self._session.flush()
        await self._session.refresh(profile)
        return profile
