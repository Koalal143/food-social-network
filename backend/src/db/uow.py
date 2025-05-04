from types import TracebackType
from typing import Self

from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.token import RefreshTokenRepository
from src.repositories.user import UserRepository
from src.repositories.user_profile import UserProfileRepository


class SQLAlchemyUnitOfWork:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

        self.users = UserRepository(self.session)
        self.refresh_tokens = RefreshTokenRepository(self.session)
        self.user_profiles = UserProfileRepository(self.session)

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        if exc_type:
            await self.rollback()

    async def commit(self) -> None:
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()
