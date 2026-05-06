from __future__ import annotations

import asyncio
from pathlib import Path

from backend.app.storage.base import BaseStorage


class LocalStorage(BaseStorage):
    def __init__(self, base_path: Path, public_url: str) -> None:
        self._base_path = base_path
        self._public_url = public_url.rstrip("/")

    async def save(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        dest = self._base_path / key
        dest.parent.mkdir(parents=True, exist_ok=True)
        await asyncio.to_thread(dest.write_bytes, data)
        return f"{self._public_url}/uploads/{key}"

    async def delete(self, key: str) -> None:
        dest = self._base_path / key
        await asyncio.to_thread(lambda: dest.unlink(missing_ok=True))
