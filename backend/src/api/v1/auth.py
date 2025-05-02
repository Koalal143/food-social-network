from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, status

from src.core.config import settings
from src.dependencies import RedisDependency, SessionDependency
from src.exceptions import (
    AppHTTPException,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
    UserNotFoundError,
)
from src.models.user import User
from src.schemas.token import Token
from src.schemas.user import UserCreate, UserLogin, UserRead
from src.services import SecurityService, TokenService, UserService
from src.services.token import RefreshTokenService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    session: SessionDependency,
) -> User:
    user_service = UserService(session=session)

    try:
        user = await user_service.create(
            username=user_in.username,
            email=user_in.email,
            hashed_password=SecurityService.get_password_hash(user_in.password),
        )
    except UserNicknameAlreadyExistsError as e:
        raise AppHTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message,
            error_key=e.error_key,
        ) from None
    except UserEmailAlreadyExistsError as e:
        raise AppHTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message,
            error_key=e.error_key,
        ) from None
    return user


@router.post("/login")
async def login(
    user_in: UserLogin,
    session: SessionDependency,
    redis: RedisDependency,
) -> Token:
    user_service = UserService(session=session)

    user = None
    try:
        if user_in.email:
            user = await user_service.get_by_email(user_in.email)
        elif user_in.username:
            user = await user_service.get_by_username(user_in.username)
        else:
            raise AppHTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email/username or password",
                error_key="incorrect_email_username_or_password",
            )
    except UserNotFoundError as e:
        raise AppHTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
            error_key=e.error_key,
        ) from None
    if not SecurityService.verify_password(user_in.password, user.hashed_password):
        raise AppHTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            error_key="incorrect_email_username_or_password",
        )

    if not user.is_active:
        raise AppHTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            error_key="inactive_user",
        )

    token_service = TokenService(session=session, redis=redis)
    refresh_token_service = RefreshTokenService(session=session)

    access_token = token_service.create_access_token(data={"sub": str(user.id)})
    refresh_token = token_service.create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(days=settings.jwt.refresh_token_expire_days),
    )

    expires_at = datetime.now(tz=UTC) + timedelta(days=settings.jwt.refresh_token_expire_days)
    await refresh_token_service.create(
        user_id=user.id,
        token=refresh_token,
        expires_at=expires_at,
    )

    await redis.set(
        f"refresh_token:{refresh_token}",
        "1",
        ex=settings.jwt.refresh_token_expire_days * 24 * 60 * 60,
    )

    await user_service.update_last_login(user)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    session: SessionDependency,
    redis: RedisDependency,
) -> Token:
    token_service = TokenService(session=session, redis=redis)
    refresh_token_service = RefreshTokenService(session=session)

    token_in_redis = await redis.get(f"refresh_token:{refresh_token}")
    if not token_in_redis:
        refresh_token_model = await refresh_token_service.get_by_token(refresh_token)
        if not refresh_token_model:
            raise AppHTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                error_key="invalid_refresh_token",
            )

    access_token = token_service.create_access_token(data={"sub": str(refresh_token_model.user_id)})
    new_refresh_token = token_service.create_access_token(
        data={"sub": str(refresh_token_model.user_id)},
        expires_delta=timedelta(days=settings.jwt.refresh_token_expire_days),
    )

    expires_at = datetime.now(tz=UTC) + timedelta(days=settings.jwt.refresh_token_expire_days)
    await refresh_token_service.update_token(
        refresh_token=refresh_token_model,
        new_token=new_refresh_token,
        new_expires_at=expires_at,
    )

    await redis.delete(f"refresh_token:{refresh_token}")
    await redis.set(
        f"refresh_token:{new_refresh_token}",
        "1",
        ex=settings.jwt.refresh_token_expire_days * 24 * 60 * 60,
    )

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )
