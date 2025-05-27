from fastapi import UploadFile

from src.exceptions.image import ImageTooLargeError, WrongImageFormatError
from src.repositories.interfaces import UserAvatarRepositoryProtocol


class UserAvatarService:
    def __init__(self, user_avatar_repository: UserAvatarRepositoryProtocol) -> None:
        self.user_avatar_repository = user_avatar_repository

    async def update_avatar(self, user_id: int, file: UploadFile) -> str:
        if not file.size or not file.content_type or not file.content_type.startswith("image/"):
            msg = "File is not an image"
            raise WrongImageFormatError(msg)

        if file.size > 5 * 1024 * 1024:
            msg = "File is larger than 5MB"
            raise ImageTooLargeError(msg)

        return await self.user_avatar_repository.upload_avatar(
            user_id=user_id,
            content=file.file,
            content_type=file.content_type,
        )

    async def get_avatar_url(self, user_id: int) -> str | None:
        return await self.user_avatar_repository.get_avatar_presigned_url(user_id)

    async def delete_avatar(self, user_id: int) -> None:
        await self.user_avatar_repository.delete_avatar(user_id)
