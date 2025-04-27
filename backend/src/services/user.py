from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import User
from src.models.user_profile import UserProfile


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, user_id: int) -> User | None:
        return await self.session.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        return await self.session.scalar(select(User).where(User.email == email))

    async def create(self, *, email: str, hashed_password: str) -> User:
        user = User(
            email=email,
            hashed_password=hashed_password,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update_last_login(self, user: User) -> User:
        user.last_login = datetime.now(tz=UTC)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_profile(self, user_id: int) -> UserProfile | None:
        return await self.session.scalar(select(UserProfile).where(UserProfile.user_id == user_id))

    async def update_profile(self, user_id: int, about: str | None = None, avatar_url: str | None = None) -> UserProfile:
        profile = await self.session.scalar(select(UserProfile).where(UserProfile.user_id == user_id))
        if not profile:
            profile = UserProfile(user_id=user_id)
            self.session.add(profile)
        if about is not None:
            profile.about = about
        if avatar_url is not None:
            profile.avatar_url = avatar_url
        await self.session.commit()
        await self.session.refresh(profile)
        return profile
