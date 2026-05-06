from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from backend.app.utils.app_logger import AppLogger


@dataclass(frozen=True, slots=True)
class ServiceConfig:
    name: str
    priority: int
    startup_delay: float = 0.2


class BaseService(ABC):
    def __init__(self, config: ServiceConfig) -> None:
        self.config = config
        self._is_setup_ready = False
        self.logger = AppLogger(self)

    @property
    def name(self) -> str:
        return self.config.name

    @property
    def priority(self) -> int:
        return self.config.priority

    @property
    def startup_delay(self) -> float:
        return self.config.startup_delay

    @property
    def is_setup_ready(self) -> bool:
        return self._is_setup_ready

    @is_setup_ready.setter
    def is_setup_ready(self, value: bool) -> None:
        self._is_setup_ready = value

    @abstractmethod
    async def setup(self) -> None:
        """Prepare connections, credentials, caches, or other prerequisites."""

    @abstractmethod
    async def start(self) -> None:
        """Start a long-lived service loop."""
