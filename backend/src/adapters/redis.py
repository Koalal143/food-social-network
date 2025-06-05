from redis.asyncio import Redis
from redis.asyncio.connection import ConnectionPool

from src.adapters.interfaces.redis import RedisAdapterProtocol


class RedisAdapter(RedisAdapterProtocol):
    """Adapter for Redis connection management."""

    def __init__(self, host: str, port: str) -> None:
        self.host = host
        self.port = port
        self.pool: ConnectionPool | None = None
        self.client: Redis | None = None
        self._initialized: bool = False

    async def init(self) -> None:
        """Initialize Redis connection."""
        try:
            self.pool = ConnectionPool.from_url(
                f"redis://{self.host}:{self.port}",
                max_connections=10,
                decode_responses=True,
            )
            self.client = Redis(connection_pool=self.pool)
            await self.client.ping()
            self._initialized = True
        except Exception as e:
            await self.close()
            msg = f"Failed to initialize Redis connection: {e}"
            raise RuntimeError(msg) from e

    async def close(self) -> None:
        """Close Redis connection and cleanup resources."""
        if self.client:
            await self.client.close()
        if self.pool:
            await self.pool.disconnect()
        self._initialized = False

    async def __aenter__(self) -> Redis:
        """Context manager entry - initialize and return Redis client."""
        if not self._initialized:
            await self.init()
        if not self.client:
            msg = "Redis client is not initialized"
            raise RuntimeError(msg)
        return self.client

    async def __aexit__(self, *args, **kwargs) -> None:  # noqa: ANN002, ANN003
        """Context manager exit - cleanup handled by DI container."""

    @property
    def is_initialized(self) -> bool:
        """Check if Redis adapter is initialized."""
        return self._initialized and self.client is not None
