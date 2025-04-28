from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.core.redis import RedisDependency
from src.db.manager import SessionDependency
from src.models.user import User
from src.services.token import TokenService

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: SessionDependency,
    redis: RedisDependency,
) -> User:
    token_service = TokenService(session=session, redis=redis)
    return await token_service.get_current_user(
        token=credentials.credentials if credentials else None,
    )

CurrentUserDependency = Annotated[User, Depends(get_current_user)]
