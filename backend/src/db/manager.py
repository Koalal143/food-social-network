from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker


class DatabaseManager:
    def __init__(self, engine: AsyncEngine, sessionmaker: async_sessionmaker[AsyncSession] | None = None) -> None:
        self.engine = engine
        self.session_factory = sessionmaker or async_sessionmaker(engine, expire_on_commit=False)

    async def get_db_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.session_factory() as session:
            yield session

    async def dispose(self) -> None:
        await self.engine.dispose()
