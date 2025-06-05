from collections.abc import AsyncGenerator

import pytest_asyncio
from dishka import Provider, Scope, make_async_container, provide
from faststream.nats import NatsBroker
from sqlalchemy.ext.asyncio import AsyncSession

from src.adapters.interfaces.recommendations import RecommendationsAdapterProtocol
from src.adapters.recommendations import RecommendationsAdapter
from src.core.config import Settings
from src.db.manager import DatabaseManager
from src.db.uow import SQLAlchemyUnitOfWork
from tests.fixtures.mocks.recommendations import MockRecommendationsAdapter


class TestDatabaseProvider(Provider):
    scope = Scope.REQUEST

    @provide
    async def get_session(self, test_database_manager: DatabaseManager) -> AsyncGenerator[AsyncSession, None]:
        async for session in test_database_manager.get_db_session():
            yield session

    @provide
    def get_unit_of_work(self, session: AsyncSession) -> SQLAlchemyUnitOfWork:
        return SQLAlchemyUnitOfWork(session=session)


class TestRecommendationsAdapterProvider(Provider):
    scope = Scope.APP

    @provide
    def get_recommendations_adapter(self, broker: NatsBroker, settings: Settings) -> RecommendationsAdapterProtocol:
        if settings.tests.use_real_recs_microservice:
            return RecommendationsAdapter(broker)
        return MockRecommendationsAdapter()


@pytest_asyncio.fixture(loop_scope="session")
async def test_dishka_container(test_database_manager: DatabaseManager, test_settings: Settings):
    from src.core.di.providers import (
        ConfigProvider,
        ElasticsearchProvider,
        FastStreamProvider,
        RedisProvider,
        RepositoryProvider,
        S3Provider,
        ServiceProvider,
    )

    container = make_async_container(
        ConfigProvider(),
        TestDatabaseProvider(),
        TestRecommendationsAdapterProvider(),
        ElasticsearchProvider(),
        FastStreamProvider(),
        RedisProvider(),
        RepositoryProvider(),
        ServiceProvider(),
        S3Provider(),
        context={Settings: test_settings, DatabaseManager: test_database_manager},
    )

    yield container
    await container.close()
