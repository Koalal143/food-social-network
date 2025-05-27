from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from elasticsearch.dsl import async_connections
from fastapi import FastAPI

from src.adapters.search.client import elastic_search_client
from src.adapters.search.indexes import search_indexes_setup
from src.core.redis import redis_manager
from src.db.manager import database_manager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await redis_manager.init()
    async_connections.add_connection("default", elastic_search_client)
    await search_indexes_setup()
    yield
    await redis_manager.close()
    await database_manager.dispose()
    await app.state.dishka_container.close()
