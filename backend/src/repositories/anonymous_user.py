import uuid
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.anonymous_user import AnonymousUser
from src.repositories.interfaces.anonymous_user import AnonymousUserRepositoryProtocol


class AnonymousUserRepository(AnonymousUserRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, **fields: Any) -> AnonymousUser:
        db_anonymous_user = AnonymousUser(**fields)
        self.session.add(db_anonymous_user)
        await self.session.flush()
        await self.session.refresh(db_anonymous_user)
        return db_anonymous_user

    async def get_by_id(self, anonymous_user_id: int) -> AnonymousUser | None:
        stmt = select(AnonymousUser).where(AnonymousUser.id == anonymous_user_id)
        result = await self.session.scalars(stmt)
        return result.first()

    async def get_by_cookie_id(self, cookie_id: uuid.UUID) -> AnonymousUser | None:
        stmt = select(AnonymousUser).where(AnonymousUser.cookie_id == cookie_id)
        result = await self.session.scalars(stmt)
        return result.first()

    async def delete_by_id(self, anonymous_user_id: int) -> None:
        stmt = delete(AnonymousUser).where(AnonymousUser.id == anonymous_user_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def exists(self, anonymous_user_id: int) -> bool:
        stmt = select(AnonymousUser.id).where(AnonymousUser.id == anonymous_user_id).exists()
        final_stmt = select(stmt)
        result = await self.session.scalar(final_stmt)
        return bool(result)

    async def exists_by_cookie_id(self, cookie_id: uuid.UUID) -> bool:
        stmt = select(AnonymousUser.id).where(AnonymousUser.cookie_id == cookie_id).exists()
        final_stmt = select(stmt)
        result = await self.session.scalar(final_stmt)
        return bool(result)
