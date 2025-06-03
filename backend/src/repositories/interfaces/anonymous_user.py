from typing import Any, Protocol

from src.models.anonymous_user import AnonymousUser


class AnonymousUserRepositoryProtocol(Protocol):
    async def create(self, **fields: Any) -> AnonymousUser: ...

    async def get_by_id(self, anonymous_user_id: int) -> AnonymousUser | None: ...
