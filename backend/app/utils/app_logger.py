from __future__ import annotations

import logging
import os
from functools import wraps

from dotenv import load_dotenv


RESET = "\033[0m"
LEVEL_COLORS = {
    "DEBUG": "\033[36m",
    "INFO": "\033[32m",
    "WARNING": "\033[33m",
    "ERROR": "\033[31m",
    "CRITICAL": "\033[1;31m",
}


def with_log_context(method):
    @wraps(method)
    def wrapper(self: AppLogger, message: str):
        return method(self, message, extra={"service_name": self.origin})

    return wrapper


class ServiceNameFilter(logging.Filter):
    aliases: dict[str, str] = {}

    def filter(self, record: logging.LogRecord) -> bool:
        record.service_name = getattr(
            record,
            "service_name",
            self.aliases.get(record.name, record.name),
        )
        return True


class ColorFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        original_levelname = record.levelname
        color = LEVEL_COLORS.get(original_levelname, "")
        if color:
            record.levelname = f"{color}{original_levelname}{RESET}"

        try:
            return super().format(record)
        finally:
            record.levelname = original_levelname


class AppLogger:
    _is_configured = False

    def __init__(self, origin: object | str, level: str | None = None) -> None:
        self.configure(level)
        self.origin = origin if isinstance(origin, str) else origin.__class__.__name__
        self.logger = logging.getLogger(self.origin)

    @classmethod
    def configure(cls, level: str | None = None, *, force: bool = False) -> None:
        if cls._is_configured and not force:
            return

        load_dotenv(override=True)
        configured_level = level or os.getenv("LOG_LEVEL", "INFO")
        resolved_level = getattr(logging, configured_level.upper(), logging.INFO)

        handler = logging.StreamHandler()
        handler.setFormatter(
            ColorFormatter("%(levelname)s %(asctime)s [%(service_name)s] %(message)s")
        )
        handler.addFilter(ServiceNameFilter())

        root_logger = logging.getLogger()
        root_logger.handlers.clear()
        root_logger.setLevel(resolved_level)
        root_logger.addHandler(handler)

        for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
            uvicorn_logger = logging.getLogger(logger_name)
            uvicorn_logger.handlers.clear()
            uvicorn_logger.propagate = True

        cls._is_configured = True

    @classmethod
    def register_service_alias(cls, logger_name: str, service_name: str) -> None:
        ServiceNameFilter.aliases[logger_name] = service_name

    @with_log_context
    def debug(self, message: str, **kwargs: object) -> None:
        self.logger.debug(message, **kwargs)

    @with_log_context
    def info(self, message: str, **kwargs: object) -> None:
        self.logger.info(message, **kwargs)

    @with_log_context
    def warning(self, message: str, **kwargs: object) -> None:
        self.logger.warning(message, **kwargs)

    @with_log_context
    def error(self, message: str, **kwargs: object) -> None:
        self.logger.error(message, **kwargs)

    @with_log_context
    def exception(self, message: str, **kwargs: object) -> None:
        self.logger.exception(message, **kwargs)

    def runtime_error(self, message: str) -> RuntimeError:
        return RuntimeError(f"[{self.origin}] {message}")
