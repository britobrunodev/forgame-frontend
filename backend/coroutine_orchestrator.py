import asyncio

from dataclasses import dataclass
from backend.base_orchestrator import BaseOrchestrator


@dataclass
class CoroutineOrchestrator(BaseOrchestrator):
    async def run(self) -> None:
        tasks: list[asyncio.Task[None]] = []

        for service in self.services:
            self.logger.info(f"Setting up service: {service.name}")
            await service.setup()
            task = asyncio.create_task(service.start())
            tasks.append(task)

        await asyncio.gather(*tasks)
