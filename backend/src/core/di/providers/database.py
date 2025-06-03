from collections.abc import AsyncIterator

from dishka import Provider, Scope, provide
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.manager import database_session_function
from src.db.uow import SQLAlchemyUnitOfWork


class DatabaseProvider(Provider):
    scope = Scope.REQUEST

    @provide
    async def get_session(self) -> AsyncIterator[AsyncSession]:
        async for session in database_session_function():
            yield session

    @provide
    def get_unit_of_work(self, session: AsyncSession) -> SQLAlchemyUnitOfWork:
        return SQLAlchemyUnitOfWork(session=session)
