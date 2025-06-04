from collections.abc import AsyncIterator

from dishka import Provider, Scope, provide
from redis.asyncio import Redis

from src.core.redis import redis_manager


class RedisProvider(Provider):
    scope = Scope.APP

    @provide
    async def get_redis_client(self) -> AsyncIterator[Redis]:
        async with redis_manager as redis:
            yield redis
