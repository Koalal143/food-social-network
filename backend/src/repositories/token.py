from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_token(self, token: str, *, active_only: bool = True) -> RefreshToken | None:
        query = select(RefreshToken).where(RefreshToken.token == token)

        if active_only:
            query = query.where(
                RefreshToken.is_active.is_(True),
                RefreshToken.expires_at > datetime.now(UTC),
            )

        return await self.session.scalar(query)

    async def create(self, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
        )
        self.session.add(refresh_token)
        return refresh_token

    async def update(
        self, refresh_token: RefreshToken, new_token: str | None = None, new_expires_at: datetime | None = None
    ) -> None:
        if new_token is not None:
            refresh_token.token = new_token
        if new_expires_at is not None:
            refresh_token.expires_at = new_expires_at

    async def deactivate(self, refresh_token: RefreshToken) -> None:
        refresh_token.is_active = False
