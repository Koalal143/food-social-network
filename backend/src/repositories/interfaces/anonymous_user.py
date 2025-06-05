from __future__ import annotations

from typing import TYPE_CHECKING, Any, Protocol

if TYPE_CHECKING:
    import uuid

    from src.models.anonymous_user import AnonymousUser


class AnonymousUserRepositoryProtocol(Protocol):
    async def create(self, **fields: Any) -> AnonymousUser: ...

    async def get_by_id(self, anonymous_user_id: int) -> AnonymousUser | None: ...

    async def get_by_cookie_id(self, cookie_id: uuid.UUID) -> AnonymousUser | None: ...

    async def delete_by_id(self, anonymous_user_id: int) -> None: ...

    async def exists(self, anonymous_user_id: int) -> bool: ...

    async def exists_by_cookie_id(self, cookie_id: uuid.UUID) -> bool: ...
