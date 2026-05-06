from __future__ import annotations

import io
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.auth.dependencies import get_current_user, get_session
from backend.app.models.user import User
from backend.app.repositories.player_profile_repository import PlayerProfileRepository
from backend.app.repositories.user_repository import UserRepository
from backend.app.storage.base import BaseStorage

router = APIRouter(prefix="/users", tags=["users"])

_AVATAR_SIZE = (256, 256)
_MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


def _get_storage(request: Request) -> BaseStorage:
    return request.app.state.storage


class PlayerProfileIn(BaseModel):
    name: str | None = None
    document_type: str | None = None
    document_number: str | None = None
    phone_country: str | None = None
    phone_number: str | None = None
    country: str | None = None
    uniform_size: str | None = None
    level: str | None = None
    sport_characteristics: dict | None = None
    preferred_class_payment_method: str | None = None


class PlayerProfileOut(BaseModel):
    name: str
    email: str
    picture_url: str | None
    google_picture_url: str | None
    document_type: str | None = None
    document_number: str | None = None
    phone_country: str | None = None
    phone_number: str | None = None
    country: str | None = None
    uniform_size: str | None = None
    level: str | None = None
    sport_characteristics: dict | None = None
    preferred_class_payment_method: str | None = None
    wins: int
    losses: int
    draws: int


def _build_profile_response(current_user: User, profile) -> PlayerProfileOut:
    return PlayerProfileOut(
        name=current_user.name,
        email=current_user.email,
        picture_url=current_user.resolved_picture_url,
        google_picture_url=current_user.google_picture_url,
        document_type=getattr(profile, "document_type", None),
        document_number=getattr(profile, "document_number", None),
        phone_country=getattr(profile, "phone_country", None),
        phone_number=getattr(profile, "phone_number", None),
        country=getattr(profile, "country", None),
        uniform_size=getattr(profile, "uniform_size", None),
        level=getattr(profile, "level", None),
        wins=getattr(profile, "wins", 0),
        losses=getattr(profile, "losses", 0),
        draws=getattr(profile, "draws", 0),
        sport_characteristics=getattr(profile, "sport_characteristics", None),
        preferred_class_payment_method=getattr(profile, "preferred_class_payment_method", None),
    )


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    storage: BaseStorage = Depends(_get_storage),
) -> JSONResponse:
    raw = await file.read(_MAX_UPLOAD_BYTES + 1)
    if len(raw) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")

    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    img = img.resize(_AVATAR_SIZE, Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=85)
    webp_bytes = buf.getvalue()

    key = f"avatars/{current_user.id}.webp"
    url = await storage.save(key, webp_bytes, "image/webp")

    await UserRepository(session).update(current_user.id, picture_url=url)

    return JSONResponse({"url": url})


@router.get("/me/profile", response_model=PlayerProfileOut)
async def get_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlayerProfileOut:
    profile = await PlayerProfileRepository(session).get_by_user_id(current_user.id)
    return _build_profile_response(current_user, profile)


@router.put("/me/profile", response_model=PlayerProfileOut)
async def update_profile(
    body: PlayerProfileIn,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlayerProfileOut:
    if body.name is not None:
        normalized_name = body.name.strip()
        if not normalized_name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        current_user.name = normalized_name

    profile = await PlayerProfileRepository(session).upsert(
        current_user.id,
        **body.model_dump(exclude={"name"}, exclude_unset=False),
    )
    await session.commit()
    await session.refresh(current_user)
    await session.refresh(profile)
    return _build_profile_response(current_user, profile)
