from typing import Annotated

from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.dependencies import RedisDependency, UnitOfWorkDependency
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


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    uow: UnitOfWorkDependency,
    redis: RedisDependency,
) -> User:
    async with uow:
        token_service = TokenService(uow=uow, redis=redis)
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


CurrentUserDependency = Annotated[User, Depends(get_current_user)]
