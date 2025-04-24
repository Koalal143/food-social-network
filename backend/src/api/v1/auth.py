from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, HTTPException, status

from src.core.config import settings
from src.core.redis import RedisManager
from src.db.manager import SessionDependency
from src.models.user import User
from src.schemas.token import Token
from src.schemas.user import UserCreate, UserRead
from src.services import SecurityService, TokenService, UserService
from src.services.token import RefreshTokenService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    session: SessionDependency,
) -> User:
    user_service = UserService(session=session)

    existing_user = await user_service.get_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    return await user_service.create(
        email=user_in.email,
        hashed_password=SecurityService.get_password_hash(user_in.password),
    )


@router.post("/login")
async def login(
    user_in: UserCreate,
    session: SessionDependency,
) -> Token:
    user_service = UserService(session=session)

    user = await user_service.get_by_email(user_in.email)
    if not user or not SecurityService.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    async with RedisManager() as redis:
        token_service = TokenService(session=session, redis=redis)
        refresh_token_service = RefreshTokenService(session=session)

        access_token = token_service.create_access_token(data={"sub": user.id})
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
) -> Token:
    async with RedisManager() as redis:
        token_service = TokenService(session=session, redis=redis)
        refresh_token_service = RefreshTokenService(session=session)
        
        token_in_redis = await redis.get(f"refresh_token:{refresh_token}")
        if not token_in_redis:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        refresh_token_model = await refresh_token_service.get_by_token(refresh_token)
        if not refresh_token_model:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        
        access_token = token_service.create_access_token(data={"sub": refresh_token_model.user_id})
        new_refresh_token = token_service.create_access_token(
            data={"sub": refresh_token_model.user_id},
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
