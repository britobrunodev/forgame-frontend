from __future__ import annotations

import asyncio

from backend.app.services.base_service import BaseService, ServiceConfig
from backend.app.adapters.base_http_adapter import BaseHttpAdapter


class ApiService(BaseService):
    def __init__(
        self,
        http_adapter: BaseHttpAdapter,
        *,
        name: str = "api_service",
        priority: int = 1,
        startup_delay: float = 0.3,
    ) -> None:
        super().__init__(
            ServiceConfig(name=name, priority=priority, startup_delay=startup_delay)
        )
        self.http_adapter = http_adapter

    async def setup(self) -> None:
        await self.http_adapter.setup()
        self.is_setup_ready = True
        self.logger.info("Setup complete")

    async def start(self) -> None:
        if not self.is_setup_ready:
            raise self.logger.runtime_error("Service must be setup before start")

        await asyncio.sleep(self.startup_delay)
        self.logger.info("Starting API service")
        await self.http_adapter.start()
        self.logger.info("API service started")
