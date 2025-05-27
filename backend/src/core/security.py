from typing import Annotated

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.exceptions import (
    AppHTTPException,
    InactiveOrNotExistingUserError,
    InvalidJWTError,
    InvalidTokenError,
    JWTSignatureExpiredError,
)
from src.models.user import User
from src.services.token import TokenService

bearer_scheme = HTTPBearer(auto_error=False)


@inject
async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    token_service: FromDishka[TokenService],
) -> User:
    try:
        return await token_service.get_current_user(
            token=credentials.credentials if credentials else None,
        )
    except (InvalidTokenError, InactiveOrNotExistingUserError, InvalidJWTError, JWTSignatureExpiredError) as e:
        raise AppHTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
            error_key=e.error_key,
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


@inject
async def get_current_user_or_none(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    token_service: FromDishka[TokenService],
) -> User | None:
    if not credentials:
        return None
    return await get_current_user(
        credentials=credentials,
        token_service=token_service,
    )


async def get_superuser(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_superuser:
        raise AppHTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
            error_key="not_enough_perms",
        )
    return current_user


CurrentUserDependency = Annotated[User, Depends(get_current_user)]
CurrentUserOrNoneDependency = Annotated[User | None, Depends(get_current_user_or_none)]
SuperUserDependency = Annotated[User, Depends(get_superuser)]
