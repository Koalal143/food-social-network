from collections.abc import AsyncIterator

from dishka import Provider, Scope, provide
from redis.asyncio import Redis

from src.adapters.interfaces.redis import RedisAdapterProtocol
from src.adapters.redis import RedisAdapter
from src.core.config import RedisConfig


class RedisProvider(Provider):
    scope = Scope.APP

    @provide
    def get_redis_adapter(self, config: RedisConfig) -> RedisAdapterProtocol:
        return RedisAdapter(config.host, str(config.port))

    @provide
    async def get_redis_client(self, adapter: RedisAdapterProtocol) -> AsyncIterator[Redis]:
        async with adapter as redis:
            yield redis
