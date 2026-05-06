"""split google and uploaded profile images

Revision ID: b5d6f9c8e2a1
Revises: 930149834383
Create Date: 2026-05-05 18:35:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b5d6f9c8e2a1"
down_revision: Union[str, None] = "930149834383"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("google_picture_url", sa.String(length=512), nullable=True))
    op.execute(
        """
        UPDATE users
        SET google_picture_url = picture_url
        WHERE picture_url IS NOT NULL AND google_picture_url IS NULL
        """
    )


def downgrade() -> None:
    op.drop_column("users", "google_picture_url")
