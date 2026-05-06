from abc import ABC, abstractmethod


class BaseHttpAdapter(ABC):
    def __init__(self, host: str, port: int) -> None:
        self.host = host
        self.port = port

    @abstractmethod
    async def setup(self) -> None:
        pass

    @abstractmethod
    async def start(self) -> None:
        pass
