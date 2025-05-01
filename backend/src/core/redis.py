from redis.asyncio import Redis
from redis.asyncio.connection import ConnectionPool

from src.core.config import settings


class RedisManager:
    def __init__(self, host: str, port: str) -> None:
        self.host = host
        self.port = port
        self.pool: ConnectionPool | None = None
        self.client: Redis | None = None
        self._initialized: bool = False

    async def init(self) -> None:
        try:
            self.pool = ConnectionPool.from_url(
                f"redis://{self.host}:{self.port}",
                max_connections=10,
                decode_responses=True,
            )
            self.client = Redis(connection_pool=self.pool)
            await self.client.ping()
        except Exception as e:
            await self.close()
            msg = f"Failed to initialize Redis connection: {e}"
            raise RuntimeError(msg) from e

    async def close(self) -> None:
        if self.client:
            await self.client.close()
        if self.pool:
            await self.pool.disconnect()
        self._initialized = False

    async def __aenter__(self) -> Redis:
        if not self._initialized:
            await self.init()
        if not self.client:
            msg = "Redis client is not _initialized"
            raise RuntimeError(msg)
        return self.client

    async def __aexit__(self, *args, **kwargs) -> None:  # noqa: ANN002, ANN003
        pass

    @property
    def is_initialized(self) -> bool:
        return self._initialized and self.client is not None


redis_manager = RedisManager(settings.redis.host, settings.redis.port)
