from collections.abc import Sequence
from typing import Protocol

from src.models.banned_email import BannedEmail
from src.schemas.banned_email import BannedEmailDomainCreate


class BannedEmailRepositoryProtocol(Protocol):
    async def get_count(self) -> int: ...

    async def get_all(self, limit: int, offset: int) -> Sequence[BannedEmail]: ...

    async def get_by_domain(self, domain: str) -> BannedEmail | None: ...

    async def create(self, banned_email_in: BannedEmailDomainCreate) -> BannedEmail: ...

    async def delete(self, domain: str) -> BannedEmail | None: ...
