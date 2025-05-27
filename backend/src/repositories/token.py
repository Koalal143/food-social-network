from datetime import UTC, datetime

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.token import RefreshToken
from src.repositories.interfaces.token import RefreshTokenRepositoryProtocol


class RefreshTokenRepository(RefreshTokenRepositoryProtocol):
    def __init__(self, session: AsyncSession, redis: Redis) -> None:
        self.session = session
        self.redis = redis

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
        await self.session.flush()
        return refresh_token

    async def update(
        self, refresh_token: RefreshToken, new_token: str | None = None, new_expires_at: datetime | None = None
    ) -> None:
        if new_token is not None:
            refresh_token.token = new_token
        if new_expires_at is not None:
            refresh_token.expires_at = new_expires_at
        await self.session.flush()

    async def deactivate(self, refresh_token: RefreshToken) -> None:
        refresh_token.is_active = False
        await self.session.flush()

    async def cache_refresh_token(self, token: str, expires_in: int) -> None:
        await self.redis.set(
            f"refresh_token:{token}",
            "1",
            ex=expires_in,
        )

    async def get_cached_refresh_token(self, token: str) -> str | None:
        result = await self.redis.get(f"refresh_token:{token}")
        return result.decode() if result else None

    async def delete_cached_refresh_token(self, token: str) -> None:
        await self.redis.delete(f"refresh_token:{token}")
