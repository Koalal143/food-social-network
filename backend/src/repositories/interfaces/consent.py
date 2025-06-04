from __future__ import annotations

from typing import TYPE_CHECKING, Any, Protocol

if TYPE_CHECKING:
    from src.models.consent import Consent


class ConsentRepositoryProtocol(Protocol):
    async def get_by_anonymous_user_id(self, anonymous_user_id: int) -> Consent | None: ...

    async def create(self, **fields: Any) -> Consent: ...

    async def update(self, anonymous_user_id: int, **fields: Any) -> Consent | None: ...

    async def delete(self, consent_id: int) -> None: ...

    async def delete_by_anonymous_user_id(self, anonymous_user_id: int) -> None: ...
