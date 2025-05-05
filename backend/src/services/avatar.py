from fastapi import UploadFile

from src.adapters.storage import S3Storage
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.image import ImageTooLargeError, WrongImageFormatError


class UserAvatarService:
    def __init__(self, uow: SQLAlchemyUnitOfWork, s3_client: S3Storage) -> None:
        self.uow = uow
        self.s3_client = s3_client

    async def update_avatar(self, user_id: int, file: UploadFile) -> str:
        if not file.size or not file.content_type or not file.content_type.startswith("image/"):
            msg = "File is not an image"
            raise WrongImageFormatError(msg)

        if file.size > 8 * 1024 * 1024 * 5:
            msg = "File is larger than 5MB"
            raise ImageTooLargeError(msg)

        file_name = f"avatars/{user_id}/avatar.png"
        await self.s3_client.upload_file(
            "images",
            file_name=file_name,
            content=file.file,
            content_type=file.content_type,
        )

        avatar_url = await self.s3_client.get_file_url("images", file_name)

        user_profile = await self.uow.user_profiles.get_by_user_id(user_id)
        if not user_profile:
            user_profile = await self.uow.user_profiles.create(user_id=user_id)

        await self.uow.user_profiles.update(user_profile, avatar_url=file_name)
        await self.uow.commit()

        return avatar_url

    async def delete_avatar(self, user_id: int) -> None:
        file_name = f"avatars/{user_id}/avatar.png"
        await self.s3_client.delete_file("images", file_name)

        user_profile = await self.uow.user_profiles.get_by_user_id(user_id)
        if user_profile:
            await self.uow.user_profiles.update(user_profile, avatar_url=None)
            await self.uow.commit()
