from dataclasses import dataclass
from abc import ABC, abstractmethod
import inspect
from backend.app.services.base_service import BaseService
from backend.app.utils.app_logger import AppLogger


@dataclass
class BaseOrchestrator(ABC):
    name: str
    services: list[BaseService]

    def __post_init__(self) -> None:
        self.logger = AppLogger(self)
        self.services = sorted(self.services, key=lambda service: service.priority)
        self.logger.info(
            f"Initialized with services: {', '.join(service.name for service in self.services)}"
        )

    @abstractmethod
    def run(self):
        pass

    async def run_orchestrator(self) -> None:
        self.logger.info("Starting orchestrator")
        result = self.run()
        if inspect.isawaitable(result):
            await result
