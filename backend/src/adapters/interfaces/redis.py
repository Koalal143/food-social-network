from typing import Protocol

from redis.asyncio import Redis


class RedisAdapterProtocol(Protocol):
    """Protocol for Redis adapter interface."""

    async def init(self) -> None:
        """Initialize Redis connection."""
        ...

    async def close(self) -> None:
        """Close Redis connection and cleanup resources."""
        ...

    async def __aenter__(self) -> Redis:
        """Context manager entry - initialize and return Redis client."""
        ...

    async def __aexit__(self, *args, **kwargs) -> None:  # noqa: ANN002, ANN003
        """Context manager exit - cleanup handled by DI container."""
        ...

    @property
    def is_initialized(self) -> bool:
        """Check if Redis adapter is initialized."""
        ...
