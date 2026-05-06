from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.database.base_repository import BaseRepository
from backend.app.models.approval import RoleApprovalRequest


class ApprovalRepository(BaseRepository[RoleApprovalRequest]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, RoleApprovalRequest)

    async def get_pending(self) -> list[RoleApprovalRequest]:
        result = await self._session.execute(
            select(RoleApprovalRequest)
            .where(RoleApprovalRequest.status == "pending")
            .options(selectinload(RoleApprovalRequest.user))
            .order_by(RoleApprovalRequest.created_at)
        )
        return list(result.scalars().all())

    async def get_pending_by_user(self, user_id: UUID, role: str) -> RoleApprovalRequest | None:
        result = await self._session.execute(
            select(RoleApprovalRequest).where(
                RoleApprovalRequest.user_id == user_id,
                RoleApprovalRequest.requested_role == role,
                RoleApprovalRequest.status == "pending",
            )
        )
        return result.scalar_one_or_none()

    async def set_status(
        self, request: RoleApprovalRequest, status: str, reviewed_by_id: UUID
    ) -> RoleApprovalRequest:
        request.status = status
        request.reviewed_by_id = reviewed_by_id
        request.reviewed_at = datetime.now(timezone.utc)
        await self._session.commit()
        await self._session.refresh(request)
        return request
