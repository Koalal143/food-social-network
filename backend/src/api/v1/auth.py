from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, status

from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions import (
    AppHTTPException,
    InactiveOrNotExistingUserError,
    IncorrectCredentialsError,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
)
from src.exceptions.auth import InvalidTokenError, SuspiciousEmailError
from src.exceptions.user import UserNotFoundError
from src.models.user import User
from src.schemas.token import Token
from src.schemas.user import UserCreate, UserLogin, UserRead
from src.services import SecurityService, TokenService, UserService
from src.services.token import RefreshTokenService
from src.utils.examples_factory import json_example_factory, json_examples_factory

router = APIRouter(route_class=DishkaRoute, prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    summary="Register a new user",
    description="Register a new user with a username, email, and password",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_409_CONFLICT: {
            "content": json_examples_factory(
                {
                    "User nickname already exists": {
                        "value": {
                            "detail": "Username already taken",
                            "error_key": "user_nickname_already_exists",
                        },
                    },
                    "User email already exists": {
                        "value": {
                            "detail": "Email already registered",
                            "error_key": "user_email_already_exists",
                        },
                    },
                    "User email is suspicious": {
                        "value": {
                            "detail": "Email is suspicious",
                            "error_key": "suspicious_email",
                        },
                    },
                },
            ),
        },
    },
)
async def register(
    user_in: UserCreate,
    user_service: FromDishka[UserService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> User:
    async with uow:
        try:
            user = await user_service.create(
                username=user_in.username,
                email=user_in.email,
                hashed_password=SecurityService.get_password_hash(user_in.password),
            )
            await uow.commit()
        except (UserNicknameAlreadyExistsError, UserEmailAlreadyExistsError) as e:
            raise AppHTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=e.message,
                error_key=e.error_key,
            ) from None
        except SuspiciousEmailError as e:
            raise AppHTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=e.message,
                error_key=e.error_key,
            ) from None
        else:
            return user


@router.post(
    "/login",
    summary="Login a user",
    description="Login a user with an email or username and password",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Incorrect email/username or password",
            "content": json_examples_factory(
                {
                    "Incorrect email/username or password": {
                        "value": {
                            "detail": "Incorrect email/username or password",
                            "error_key": "incorrect_email_username_or_password",
                        },
                    },
                    "Inactive user": {
                        "value": {
                            "detail": "Inactive user",
                            "error_key": "inactive_user",
                        },
                    },
                },
            ),
        },
    },
)
async def login(
    user_in: UserLogin,
    user_service: FromDishka[UserService],
    token_service: FromDishka[TokenService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> Token:
    async with uow:
        try:
            user = await user_service.authenticate(
                email=user_in.email,
                username=user_in.username,
                password=user_in.password,
            )
        except (
            UserEmailAlreadyExistsError,
            UserNicknameAlreadyExistsError,
            InactiveOrNotExistingUserError,
            IncorrectCredentialsError,
        ) as e:
            raise AppHTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=e.message,
                error_key=e.error_key,
            ) from None
        except UserNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=e.message,
                error_key=e.error_key,
            ) from None

        tokens = await token_service.create_tokens(user.id)
        await user_service.update_last_login(user)
        await uow.commit()
        return tokens


@router.post(
    "/refresh",
    summary="Refresh a user's access token",
    description="Refresh a user's access token with a refresh token",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "content": json_example_factory(
                {
                    "detail": "Invalid refresh token",
                    "error_key": "invalid_refresh_token",
                },
            ),
        },
    },
)
async def refresh_token(
    refresh_token: str,
    refresh_token_service: FromDishka[RefreshTokenService],
    token_service: FromDishka[TokenService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> Token:
    async with uow:
        try:
            result = await refresh_token_service.generate_new_refresh_token(refresh_token, token_service)
            await uow.commit()
        except InvalidTokenError as e:
            raise AppHTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=e.message,
                error_key=e.error_key,
            ) from None
        else:
            return result
