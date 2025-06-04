from collections.abc import AsyncIterator

from dishka import Provider, Scope, provide
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from src.core.config import PostgresConfig
from src.db.manager import DatabaseManager
from src.db.uow import SQLAlchemyUnitOfWork


class DatabaseProvider(Provider):
    @provide(scope=Scope.APP)
    def get_database_engine(self, config: PostgresConfig) -> AsyncEngine:
        return create_async_engine(
            config.url,
            echo=config.echo,
            pool_size=10,
            max_overflow=20,
        )

    @provide(scope=Scope.APP)
    def get_database_sessionmaker(self, engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
        return async_sessionmaker(engine, expire_on_commit=False, autoflush=True)

    @provide(scope=Scope.APP)
    def get_database_manager(
        self, engine: AsyncEngine, sessionmaker: async_sessionmaker[AsyncSession]
    ) -> DatabaseManager:
        return DatabaseManager(engine, sessionmaker)

    @provide(scope=Scope.REQUEST)
    async def get_session(self, manager: DatabaseManager) -> AsyncIterator[AsyncSession]:
        async for session in manager.get_db_session():
            yield session

    @provide(scope=Scope.REQUEST)
    def get_unit_of_work(self, session: AsyncSession) -> SQLAlchemyUnitOfWork:
        return SQLAlchemyUnitOfWork(session=session)
