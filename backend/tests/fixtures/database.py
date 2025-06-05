from collections.abc import AsyncGenerator

import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.core.config import Settings
from src.db.manager import DatabaseManager
from src.models import Base


@pytest_asyncio.fixture(autouse=True, loop_scope="session")
async def test_engine(test_settings: Settings):
    engine = create_async_engine(
        test_settings.postgres.url,
        echo=False,
        pool_size=5,
        max_overflow=10,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(loop_scope="session")
async def test_sessionmaker(test_engine):
    return async_sessionmaker(test_engine, expire_on_commit=False)


@pytest_asyncio.fixture
async def test_session(test_sessionmaker) -> AsyncGenerator[AsyncSession, None]:
    async with test_sessionmaker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(loop_scope="session")
async def test_database_manager(test_engine, test_sessionmaker) -> DatabaseManager:
    return DatabaseManager(test_engine, test_sessionmaker)
