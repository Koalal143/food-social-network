from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user_profile import UserProfile


class UserProfileRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_user_id(self, user_id: int) -> UserProfile | None:
        return await self.session.scalars(select(UserProfile).where(UserProfile.user_id == user_id))

    async def create(self, user_id: int) -> UserProfile:
        profile = UserProfile(user_id=user_id)
        self.session.add(profile)
        return profile

    async def update(self, profile: UserProfile, about: str | None = None, avatar_url: str | None = None) -> None:
        if about is not None:
            profile.about = about
        if avatar_url is not None:
            profile.avatar_url = avatar_url
