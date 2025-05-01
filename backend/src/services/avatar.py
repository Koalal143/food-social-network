from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from src.adapters.storage import S3Storage
from src.services.user import UserService


class UserAvatarService:
    def __init__(self, session: AsyncSession, s3_client: S3Storage) -> None:
        self.session = session
        self.s3_client = s3_client
        self.user_service = UserService(session)

    async def update_avatar(self, user_id: int, file: UploadFile) -> str:
        file_name = f"avatars/{user_id}/avatar.png"
        await self.s3_client.upload_file(
            "images",
            file_name=file_name,
            content=file.file,
            content_type=file.content_type,
        )
        avatar_url = await self.s3_client.get_file_url("images", file_name)
        await self.user_service.update_profile(user_id, avatar_url=avatar_url)
        await self.session.commit()
        return avatar_url

    async def delete_avatar(self, user_id: int) -> None:
        file_name = f"avatars/{user_id}/avatar.png"
        await self.s3_client.delete_file("images", file_name)
        await self.user_service.update_profile(user_id, avatar_url=None)
        await self.session.commit()
