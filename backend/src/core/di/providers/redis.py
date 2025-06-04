from collections.abc import AsyncIterator

from dishka import Provider, Scope, provide
from redis.asyncio import Redis

from src.core.config import RedisConfig
from src.core.redis import RedisManager


class RedisProvider(Provider):
    scope = Scope.APP

    @provide
    def get_redis_manager(self, config: RedisConfig) -> RedisManager:
        return RedisManager(config.host, str(config.port))

    @provide
    async def get_redis_client(self, manager: RedisManager) -> AsyncIterator[Redis]:
        async with manager as redis:
            yield redis
