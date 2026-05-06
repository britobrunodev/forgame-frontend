from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.auth.dependencies import get_current_user, get_session, get_settings, require_roles
from backend.app.auth.google_oauth import get_google_user_info
from backend.app.auth.jwt_handler import create_access_token
from backend.app.auth.rbac import GRANTABLE_ROLES, Role
from backend.app.config.project_settings import ProjectSettings
from backend.app.models.user import User
from backend.app.repositories.approval_repository import ApprovalRepository
from backend.app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleLoginRequest(BaseModel):
    access_token: str
    requested_profile: Literal["player", "gestor"] = "player"


class UserPayload(BaseModel):
    id: str
    email: str
    name: str
    picture_url: str | None
    roles: list[str]


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    pending_approval: bool = False
    user: UserPayload


class ApprovalResponse(BaseModel):
    id: str
    user_id: str
    user_email: str
    user_name: str
    requested_role: str
    status: str
    created_at: datetime


class GrantRoleRequest(BaseModel):
    user_id: UUID
    role: Role


@router.post("/google", response_model=AuthResponse)
async def google_login(
    body: GoogleLoginRequest,
    session: AsyncSession = Depends(get_session),
    settings: ProjectSettings = Depends(get_settings),
) -> AuthResponse:
    try:
        google_data = await get_google_user_info(body.access_token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))

    repo = UserRepository(session)
    user = await repo.get_by_google_id(google_data["google_id"])

    if user is None:
        user = await repo.create(
            google_id=google_data["google_id"],
            email=google_data["email"],
            name=google_data["name"],
            picture_url=None,
            google_picture_url=google_data.get("picture_url"),
        )
        await repo.add_role(user.id, Role.PLAYER)
        user = await repo.get_by_id(user.id)
    elif google_data.get("picture_url") and user.google_picture_url != google_data["picture_url"]:
        await repo.update(user.id, google_picture_url=google_data["picture_url"])
        user = await repo.get_by_id(user.id)

    user_roles = {r.role for r in user.roles}
    pending_approval = False

    if body.requested_profile == "gestor" and Role.OWNER not in user_roles:
        approval_repo = ApprovalRepository(session)
        existing = await approval_repo.get_pending_by_user(user.id, Role.OWNER)
        if existing is None:
            await approval_repo.create(user_id=user.id, requested_role=Role.OWNER)
        pending_approval = True

    return AuthResponse(
        access_token=create_access_token(str(user.id), settings),
        pending_approval=pending_approval,
        user=UserPayload(
            id=str(user.id),
            email=user.email,
            name=user.name,
            picture_url=user.resolved_picture_url,
            roles=list(user_roles),
        ),
    )


@router.get("/me", response_model=UserPayload)
async def get_me(current_user: User = Depends(get_current_user)) -> UserPayload:
    return UserPayload(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        picture_url=current_user.resolved_picture_url,
        roles=[r.role for r in current_user.roles],
    )


@router.get("/approvals", response_model=list[ApprovalResponse])
async def list_approvals(
    current_user: User = Depends(require_roles(Role.OWNER)),
    session: AsyncSession = Depends(get_session),
) -> list[ApprovalResponse]:
    requests = await ApprovalRepository(session).get_pending()
    return [
        ApprovalResponse(
            id=str(r.id),
            user_id=str(r.user_id),
            user_email=r.user.email,
            user_name=r.user.name,
            requested_role=r.requested_role,
            status=r.status,
            created_at=r.created_at,
        )
        for r in requests
    ]


@router.post("/approvals/{request_id}/approve")
async def approve_request(
    request_id: UUID,
    current_user: User = Depends(require_roles(Role.OWNER)),
    session: AsyncSession = Depends(get_session),
) -> dict:
    approval_repo = ApprovalRepository(session)
    request = await approval_repo.get_by_id(request_id)
    if request is None or request.status != "pending":
        raise HTTPException(status_code=404, detail="Pending request not found")

    user_repo = UserRepository(session)
    user = await user_repo.get_by_id(request.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    existing_roles = {r.role for r in user.roles}
    if request.requested_role not in existing_roles:
        await user_repo.add_role(request.user_id, request.requested_role, granted_by_id=current_user.id)

    await approval_repo.set_status(request, "approved", current_user.id)
    return {"message": f"Request approved — '{request.requested_role}' granted to {user.email}"}


@router.post("/approvals/{request_id}/reject")
async def reject_request(
    request_id: UUID,
    current_user: User = Depends(require_roles(Role.OWNER)),
    session: AsyncSession = Depends(get_session),
) -> dict:
    approval_repo = ApprovalRepository(session)
    request = await approval_repo.get_by_id(request_id)
    if request is None or request.status != "pending":
        raise HTTPException(status_code=404, detail="Pending request not found")

    await approval_repo.set_status(request, "rejected", current_user.id)
    return {"message": "Request rejected"}


@router.post("/roles")
async def grant_role(
    body: GrantRoleRequest,
    current_user: User = Depends(require_roles(Role.OWNER)),
    session: AsyncSession = Depends(get_session),
) -> dict:
    if body.role not in GRANTABLE_ROLES:
        raise HTTPException(status_code=400, detail=f"Role '{body.role}' cannot be granted")

    repo = UserRepository(session)
    target_user = await repo.get_by_id(body.user_id)
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if body.role in {r.role for r in target_user.roles}:
        raise HTTPException(status_code=409, detail="User already has this role")

    await repo.add_role(body.user_id, body.role, granted_by_id=current_user.id)
    return {"message": f"Role '{body.role}' granted to user '{body.user_id}'"}


@router.delete("/roles")
async def revoke_role(
    body: GrantRoleRequest,
    current_user: User = Depends(require_roles(Role.OWNER)),
    session: AsyncSession = Depends(get_session),
) -> dict:
    if body.role == Role.PLAYER:
        raise HTTPException(status_code=400, detail="Cannot revoke PLAYER role")

    removed = await UserRepository(session).remove_role(body.user_id, body.role)
    if not removed:
        raise HTTPException(status_code=404, detail="Role not found for this user")

    return {"message": f"Role '{body.role}' revoked from user '{body.user_id}'"}
