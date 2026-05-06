from __future__ import annotations

from abc import ABC, abstractmethod


class BaseStorage(ABC):
    @abstractmethod
    async def save(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        """Save data and return its public URL."""

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete stored object by key."""
