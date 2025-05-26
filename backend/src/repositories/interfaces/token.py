from datetime import datetime
from typing import Protocol

from src.models.token import RefreshToken


class RefreshTokenRepositoryProtocol(Protocol):
    async def get_by_token(self, token: str, *, active_only: bool = True) -> RefreshToken | None: ...

    async def create(self, user_id: int, token: str, expires_at: datetime) -> RefreshToken: ...

    async def update(
        self, refresh_token: RefreshToken, new_token: str | None = None, new_expires_at: datetime | None = None
    ) -> None: ...

    async def deactivate(self, refresh_token: RefreshToken) -> None: ...
