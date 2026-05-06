from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.adapters.base_http_adapter import BaseHttpAdapter
from backend.app.config.project_settings import ProjectSettings
from backend.app.database.connection import create_engine, create_session_factory
from backend.app.routers.auth import router as auth_router
from backend.app.routers.health import router as health_router
from backend.app.routers.sport_complex import router as sport_complex_router
from backend.app.routers.users import router as users_router
from backend.app.storage.local import LocalStorage
from backend.app.utils.app_logger import AppLogger


class FastApiAdapter(BaseHttpAdapter):
    def __init__(self) -> None:
        settings: ProjectSettings = ProjectSettings.from_env()
        super().__init__(settings.api_host, settings.api_port)
        self.settings = settings
        self.logger = AppLogger(self)
        AppLogger.register_service_alias("uvicorn", self.__class__.__name__)
        AppLogger.register_service_alias("uvicorn.error", self.__class__.__name__)
        AppLogger.register_service_alias("uvicorn.access", self.__class__.__name__)
        self.app: FastAPI | None = None

    async def setup(self) -> None:
        try:
            self.app = self._create_app()
            self.logger.info("FastAPI app setup complete")
        except Exception:
            self.logger.exception("Failed to setup FastAPI app")
            raise

    def _create_app(self) -> FastAPI:
        settings = self.settings
        prefix = f"/{settings.api_prefix}/{settings.api_version}"

        uploads_path = Path(settings.uploads_dir).resolve()
        uploads_path.mkdir(parents=True, exist_ok=True)

        @asynccontextmanager
        async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
            engine = create_engine(settings)
            app.state.engine = engine
            app.state.session_factory = create_session_factory(engine)
            app.state.settings = settings
            app.state.storage = LocalStorage(uploads_path, settings.public_url)
            yield
            await engine.dispose()

        app = FastAPI(
            title=settings.app_title,
            lifespan=lifespan,
            docs_url=f"{prefix}/docs",
            redoc_url=f"{prefix}/redoc",
            openapi_url=f"{prefix}/openapi.json",
        )
        self._setup_middlewares(app)
        self._setup_routers(app, prefix)
        return app

    def _setup_middlewares(self, app: FastAPI) -> None:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def _setup_routers(self, app: FastAPI, prefix: str) -> None:
        uploads_path = Path(self.settings.uploads_dir).resolve()
        app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")
        app.include_router(health_router, prefix=prefix)
        app.include_router(auth_router, prefix=prefix)
        app.include_router(sport_complex_router, prefix=prefix)
        app.include_router(users_router, prefix=prefix)

    async def start(self) -> None:
        if self.app is None:
            raise self.logger.runtime_error("FastAPI app was not setup")

        try:
            self.logger.info(f"Starting FastAPI server on {self.host}:{self.port}")
            config = uvicorn.Config(self.app, host=self.host, port=self.port, log_config=None)
            server = uvicorn.Server(config)
            await server.serve()
        except Exception:
            self.logger.exception("Failed to start FastAPI server")
            raise
