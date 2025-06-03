from typing import BinaryIO

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.adapters.storage import S3Storage
from src.models.user_profile import UserProfile
from src.repositories.interfaces.user_avatar import UserAvatarRepositoryProtocol


class UserAvatarRepository(UserAvatarRepositoryProtocol):
    def __init__(self, session: AsyncSession, s3_storage: S3Storage) -> None:
        self.session = session
        self.s3_storage = s3_storage
        self._bucket_name = "images"

    async def get_avatar_url(self, user_id: int) -> str | None:
        stmt = select(UserProfile.avatar_url).where(UserProfile.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_avatar_url(self, user_id: int, avatar_url: str) -> None:
        stmt = update(UserProfile).where(UserProfile.user_id == user_id).values(avatar_url=avatar_url)
        await self.session.execute(stmt)
        await self.session.flush()

    async def delete_avatar_url(self, user_id: int) -> None:
        stmt = update(UserProfile).where(UserProfile.user_id == user_id).values(avatar_url=None)
        await self.session.execute(stmt)
        await self.session.flush()

    async def upload_avatar(
        self,
        user_id: int,
        content: BinaryIO,
        content_type: str,
    ) -> str:
        file_name = f"avatars/{user_id}/avatar.png"

        await self.s3_storage.upload_file(
            bucket_name=self._bucket_name,
            file_name=file_name,
            content=content,
            content_type=content_type,
        )

        await self.update_avatar_url(user_id=user_id, avatar_url=file_name)

        return await self.s3_storage.get_file_url(self._bucket_name, file_name)

    async def delete_avatar(self, user_id: int) -> None:
        file_name = f"avatars/{user_id}/avatar.png"

        await self.s3_storage.delete_file(self._bucket_name, file_name)
        await self.delete_avatar_url(user_id)

    async def get_avatar_presigned_url(self, user_id: int) -> str | None:
        avatar_url = await self.get_avatar_url(user_id)
        if avatar_url:
            return await self.s3_storage.get_file_url(self._bucket_name, avatar_url)
        return None
