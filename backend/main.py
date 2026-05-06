import asyncio
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.adapters.fastapi_adapter import FastApiAdapter
from backend.app.services.api_service import ApiService
from backend.app.services.base_service import BaseService
from backend.base_orchestrator import BaseOrchestrator
from backend.coroutine_orchestrator import CoroutineOrchestrator


def get_services() -> list[BaseService]:
    return [
        ApiService(http_adapter=FastApiAdapter(), priority=1, startup_delay=0.35),
    ]


def create_orchestrator() -> BaseOrchestrator:
    return CoroutineOrchestrator(name="CoroutineOrchestrator", services=get_services())


async def run_orchestrator(orchestrator: BaseOrchestrator) -> None:
    await orchestrator.run_orchestrator()


def main() -> None:
    orchestrator = create_orchestrator()
    asyncio.run(run_orchestrator(orchestrator))


if __name__ == "__main__":
    main()
