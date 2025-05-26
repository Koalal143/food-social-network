from typing import Any, Protocol

from src.models.user_profile import UserProfile


class UserProfileRepositoryProtocol(Protocol):
    async def get_by_user_id(self, user_id: int) -> UserProfile | None: ...

    async def create(self, user_id: int) -> UserProfile: ...

    async def update(self, user_id: int, **fields: Any) -> UserProfile: ...
