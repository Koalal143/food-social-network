from collections.abc import Sequence
from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, user_id: int) -> User | None:
        return await self.session.scalar(select(User).where(User.id == user_id))

    async def get_with_profile(self, user_id: int) -> User | None:
        return await self.session.scalar(select(User).options(joinedload(User.profile)).where(User.id == user_id))

    async def get_by_email(self, email: str) -> User | None:
        return await self.session.scalar(select(User).options(joinedload(User.profile)).where(User.email == email))

    async def get_by_username(self, username: str) -> User | None:
        return await self.session.scalar(
            select(User).options(joinedload(User.profile)).where(User.username == username)
        )

    async def check_username_email_exists(self, username: str, email: str) -> Sequence[User]:
        result = await self.session.execute(select(User).where((User.username == username) | (User.email == email)))
        return result.scalars().all()

    async def create(self, username: str, email: str, hashed_password: str) -> User:
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
        )
        self.session.add(user)
        return user

    async def update_last_login(self, user_id: int, last_login: datetime | None) -> None:
        await self.session.execute(
            update(User).where(User.id == user_id).values(last_login=last_login or datetime.now(UTC))
        )

    async def update_username(self, user_id: int, username: str) -> None:
        await self.session.execute(update(User).where(User.id == user_id).values(username=username))
