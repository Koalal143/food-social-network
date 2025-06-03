from datetime import UTC, datetime, timedelta

from jose import ExpiredSignatureError, JWTError, jwt

from src.core.config import settings
from src.exceptions.auth import (
    InactiveOrNotExistingUserError,
    InvalidJWTError,
    InvalidTokenError,
    JWTSignatureExpiredError,
)
from src.models.token import RefreshToken
from src.models.user import User
from src.repositories.interfaces import RefreshTokenRepositoryProtocol, UserRepositoryProtocol
from src.schemas.token import Token


class TokenService:
    def __init__(
        self,
        refresh_token_repository: RefreshTokenRepositoryProtocol,
        user_repository: UserRepositoryProtocol,
    ) -> None:
        self.refresh_token_repository = refresh_token_repository
        self.user_repository = user_repository

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
        except ExpiredSignatureError:
            msg = "Could not validate credentials: token has expired"
            raise JWTSignatureExpiredError(msg) from None
        except JWTError:
            msg = "Could not validate credentials: invalid jwt"
            raise InvalidJWTError(msg) from None

    async def get_current_user(self, token: str | None) -> User:
        if not token:
            msg = "Could not validate credentials: no scheme or token in Authorization header"
            raise InvalidTokenError(msg)

        payload = await self.verify_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            msg = "Could not validate credentials: no user ID in payload"
            raise InvalidTokenError(msg)

        user_id = int(user_id_str)
        user = await self.user_repository.get(user_id)
        if not user or not user.is_active:
            msg = "Could not validate credentials: user is inactive or user does not exists"
            raise InactiveOrNotExistingUserError(msg)

        return user

    async def create_tokens(self, user_id: int) -> Token:
        access_token = self.create_access_token(data={"sub": str(user_id)})
        refresh_token = self.create_access_token(
            data={"sub": str(user_id)},
            expires_delta=timedelta(days=settings.jwt.refresh_token_expire_days),
        )

        await self.refresh_token_repository.cache_refresh_token(
            token=refresh_token,
            expires_in=settings.jwt.refresh_token_expire_days * 24 * 60 * 60,
        )

        expires_at = datetime.now(tz=UTC) + timedelta(days=settings.jwt.refresh_token_expire_days)
        await self.refresh_token_repository.create(
            user_id=user_id,
            token=refresh_token,
            expires_at=expires_at,
        )

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
        )


class RefreshTokenService:
    def __init__(self, refresh_token_repository: RefreshTokenRepositoryProtocol) -> None:
        self.refresh_token_repository = refresh_token_repository

    async def verify_refresh_token(self, token: str) -> RefreshToken:
        token_in_cache = await self.refresh_token_repository.get_cached_refresh_token(token)
        if not token_in_cache:
            msg = "Invalid refresh token"
            raise InvalidTokenError(msg)

        refresh_token = await self.refresh_token_repository.get_by_token(token)
        if not refresh_token:
            msg = "Invalid refresh token"
            raise InvalidTokenError(msg)

        return refresh_token

    async def update_token(self, refresh_token: RefreshToken, new_token: str, new_expires_at: datetime) -> RefreshToken:
        await self.refresh_token_repository.update(refresh_token, new_token=new_token, new_expires_at=new_expires_at)
        return refresh_token

    async def deactivate(self, refresh_token: RefreshToken) -> None:
        await self.refresh_token_repository.deactivate(refresh_token)

    async def generate_new_refresh_token(self, refresh_token_str: str, token_service: TokenService) -> Token:
        refresh_token_model = await self.verify_refresh_token(refresh_token_str)

        access_token = token_service.create_access_token(data={"sub": str(refresh_token_model.user_id)})
        new_refresh_token = token_service.create_access_token(
            data={"sub": str(refresh_token_model.user_id)},
            expires_delta=timedelta(days=settings.jwt.refresh_token_expire_days),
        )

        expires_at = datetime.now(tz=UTC) + timedelta(days=settings.jwt.refresh_token_expire_days)
        await self.update_token(
            refresh_token=refresh_token_model,
            new_token=new_refresh_token,
            new_expires_at=expires_at,
        )

        await self.refresh_token_repository.delete_cached_refresh_token(refresh_token_str)
        await self.refresh_token_repository.cache_refresh_token(
            token=new_refresh_token,
            expires_in=settings.jwt.refresh_token_expire_days * 24 * 60 * 60,
        )

        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
        )
