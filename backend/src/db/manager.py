from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from src.core.config import settings


class DatabaseManager:
    def __init__(self, engine: AsyncEngine, sessionmaker: async_sessionmaker[AsyncSession] | None = None) -> None:
        self.engine = engine
        self.session_factory = sessionmaker or async_sessionmaker(engine, expire_on_commit=False)

    async def get_db_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.session_factory() as session:
            yield session

    async def dispose(self) -> None:
        await self.engine.dispose()


db_engine = create_async_engine(
    settings.postgres.url,
    echo=settings.postgres.echo,
    pool_size=10,
    max_overflow=20,
)
db_sessionmaker = async_sessionmaker(db_engine, expire_on_commit=False, autoflush=True)
database_manager = DatabaseManager(db_engine, db_sessionmaker)
database_session_function = database_manager.get_db_session

SessionDependency = Annotated[AsyncSession, Depends(database_session_function)]
