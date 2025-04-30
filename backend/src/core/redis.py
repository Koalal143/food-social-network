from __future__ import annotations

from asyncio import Lock
from typing import TYPE_CHECKING, Annotated, Any, Self

from fastapi import Depends
from redis.asyncio import Redis
from redis.asyncio.connection import ConnectionPool

from src.core.config import settings

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator


class RedisManager:
    _instance: RedisManager | None = None

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super().__new__(cls, *args, **kwargs)
        return cls._instance  # type: ignore[return-value]

    def __init__(self) -> None:
        if hasattr(self, "initialized"):
            return
        self.pool: ConnectionPool | None = None
        self.client: Redis | None = None
        self.initialized: bool = False
        self._init_lock: Lock = Lock()

    async def init(self) -> None:
        async with self._init_lock:
            if self.initialized:
                return

            try:
                self.pool = ConnectionPool.from_url(
                    f"redis://{settings.redis.host}:{settings.redis.port}",
                    max_connections=10,
                    decode_responses=True,
                )
                self.client = Redis(connection_pool=self.pool)
                await self.client.ping()
                self.initialized = True
            except Exception as e:
                await self.close()
                msg = f"Failed to initialize Redis connection: {e}"
                raise RuntimeError(msg) from e

    async def close(self) -> None:
        if self.client:
            await self.client.close()
        if self.pool:
            await self.pool.disconnect()
        self.initialized = False

    async def __aenter__(self) -> Redis:
        if not self.initialized:
            await self.init()
        if not self.client:
            msg = "Redis client is not initialized"
            raise RuntimeError(msg)
        return self.client

    async def __aexit__(self, *args, **kwargs) -> None:  # noqa: ANN002, ANN003
        pass

    @property
    def is_initialized(self) -> bool:
        return self.initialized and self.client is not None


async def get_redis() -> AsyncGenerator[Redis, None]:
    async with RedisManager() as redis:
        yield redis


RedisDependency = Annotated[Redis, Depends(get_redis)]
