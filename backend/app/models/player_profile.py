from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import Base


class PlayerProfile(Base):
    __tablename__ = "player_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    document_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    document_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phone_country: Mapped[str | None] = mapped_column(String(10), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    uniform_size: Mapped[str | None] = mapped_column(String(10), nullable=True)
    level: Mapped[str | None] = mapped_column(String(30), nullable=True)
    wins: Mapped[int] = mapped_column(default=0, nullable=False, server_default="0")
    losses: Mapped[int] = mapped_column(default=0, nullable=False, server_default="0")
    draws: Mapped[int] = mapped_column(default=0, nullable=False, server_default="0")
    sport_characteristics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    preferred_class_payment_method: Mapped[str | None] = mapped_column(String(30), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="player_profile")  # type: ignore[name-defined]  # noqa: F821
