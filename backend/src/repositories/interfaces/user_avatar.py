from typing import BinaryIO, Protocol


class UserAvatarRepositoryProtocol(Protocol):
    async def get_avatar_url(self, user_id: int) -> str | None: ...

    async def update_avatar_url(self, user_id: int, avatar_url: str) -> None: ...

    async def delete_avatar_url(self, user_id: int) -> None: ...

    async def upload_avatar(
        self,
        user_id: int,
        content: BinaryIO,
        content_type: str,
    ) -> str: ...

    async def delete_avatar(self, user_id: int) -> None: ...

    async def get_avatar_presigned_url(self, user_id: int) -> str | None: ...
