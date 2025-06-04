import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from elasticsearch import AsyncElasticsearch
from elasticsearch.dsl import async_connections
from fastapi import FastAPI
from faststream.nats import NatsBroker
from redis.asyncio import Redis

from src.adapters.search.indexes import search_indexes_setup
from src.db.manager import DatabaseManager

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Initialize services through DI container
    async with app.state.dishka_container() as request_container:
        # Initialize Redis through DI container
        redis_client: Redis = await request_container.get(Redis)
        await redis_client.ping()  # Test Redis connection
        logger.info("Redis client initialized and connected through DI container")

        # Initialize Elasticsearch through DI container
        es_client: AsyncElasticsearch = await request_container.get(AsyncElasticsearch)
        async_connections.add_connection("default", es_client)
        await search_indexes_setup()
        logger.info("Elasticsearch client initialized through DI container")

        # Initialize NATS broker
        broker: NatsBroker = await request_container.get(NatsBroker)
        await broker.start()
        logger.info("NATS broker started")

    logger.info("Application startup completed")

    yield

    logger.info("Starting application shutdown...")

    # Cleanup services through DI container
    async with app.state.dishka_container() as request_container:
        # Cleanup database connections
        db_manager: DatabaseManager = await request_container.get(DatabaseManager)
        await db_manager.dispose()
        logger.info("Database connections disposed")

        # Cleanup NATS broker
        shutdown_broker: NatsBroker = await request_container.get(NatsBroker)
        await shutdown_broker.close()
        logger.info("NATS broker closed")

    await app.state.dishka_container.close()
    logger.info("DI container closed")

    logger.info("Application shutdown completed")
