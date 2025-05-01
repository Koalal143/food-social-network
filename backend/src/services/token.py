from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from jose import JWTError, jwt
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.models.token import RefreshToken
from src.models.user import User


class TokenService:
    def __init__(self, session: AsyncSession, redis: Redis) -> None:
        self.session = session
        self.redis = redis

    def _exception_fabric(self, detail: str) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    def create_access_token(self, data: dict, expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(tz=UTC) + expires_delta
        else:
            expire = datetime.now(tz=UTC) + timedelta(minutes=settings.jwt.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.jwt.secret_key, algorithm=settings.jwt.algorithm)

    async def verify_token(self, token: str) -> dict:
        try:
            return jwt.decode(
                token,
                settings.jwt.secret_key,
                algorithms=settings.jwt.algorithm,
            )
        except JWTError as e:
            msg = f"Could not validate credentials: {e}"
            raise self._exception_fabric(msg) from None

    async def get_current_user(self, token: str | None) -> User:
        if not token:
            msg = "Could not validate credentials"
            raise self._exception_fabric(msg)

        payload = await self.verify_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            msg = "Could not validate credentials: no user ID in JWT"
            raise self._exception_fabric(msg)

        user_id = int(user_id_str)
        user = await self.session.scalar(select(User).where(User.id == user_id))
        if not user or not user.is_active:
            msg = "Could not validate credentials: user is inactive or user does not exists"
            raise self._exception_fabric(msg)

        return user

    async def verify_refresh_token(self, token: str) -> RefreshToken:
        token_in_redis = await self.redis.get(f"refresh_token:{token}")
        if not token_in_redis:
            msg = "Invalid refresh token"
            raise self._exception_fabric(msg)

        refresh_token = await self.session.scalar(
            select(RefreshToken).where(
                RefreshToken.token == token,
                RefreshToken.is_active.is_(True),
                RefreshToken.expires_at > datetime.now(tz=UTC),
            )
        )
        if not refresh_token:
            msg = "Invalid refresh token"
            raise self._exception_fabric(msg)

        return refresh_token


class RefreshTokenService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_token(self, token: str) -> RefreshToken | None:
        return await self.session.scalar(
            select(RefreshToken).where(
                RefreshToken.token == token,
                RefreshToken.is_active.is_(True),
                RefreshToken.expires_at > datetime.now(tz=UTC),
            )
        )

    async def create(self, *, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
        )
        self.session.add(refresh_token)
        await self.session.commit()
        await self.session.refresh(refresh_token)
        return refresh_token

    async def update_token(self, refresh_token: RefreshToken, new_token: str, new_expires_at: datetime) -> RefreshToken:
        refresh_token.token = new_token
        refresh_token.expires_at = new_expires_at
        await self.session.commit()
        await self.session.refresh(refresh_token)
        return refresh_token

    async def deactivate(self, refresh_token: RefreshToken) -> None:
        refresh_token.is_active = False
        await self.session.commit()
