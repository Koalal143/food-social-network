from collections.abc import AsyncGenerator

from fastapi import FastAPI

from src.core.redis import redis_manager
from src.db.manager import database_manager


async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await redis_manager.init()
    yield
    await redis_manager.close()
    await database_manager.dispose()
