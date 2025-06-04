from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user_profile import UserProfile
from src.repositories.interfaces.user_profile import UserProfileRepositoryProtocol


class UserProfileRepository(UserProfileRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_user_id(self, user_id: int) -> UserProfile | None:
        result = await self.session.scalars(select(UserProfile).where(UserProfile.user_id == user_id))
        return result.first()

    async def create(self, user_id: int) -> UserProfile:
        profile = UserProfile(user_id=user_id)
        self.session.add(profile)
        await self.session.flush()
        return profile

    async def update(self, user_id: int, **fields: Any) -> UserProfile | None:
        result = await self.session.scalars(
            update(UserProfile).where(UserProfile.user_id == user_id).values(**fields).returning(UserProfile)
        )
        await self.session.flush()
        return result.first()
