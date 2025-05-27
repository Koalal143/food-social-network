import logging
from collections.abc import Callable

from fastapi import Request, Response
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from src.core.di import container
from src.db.uow import SQLAlchemyUnitOfWork
from src.schemas.anonymous_user import AnonymousUserCreate
from src.services.anonymous_user import AnonymousUserService

logger = logging.getLogger(__name__)


class AnonymousUserMiddlewareConfig(BaseModel):
    cookie_name: str = "anonymous_id"
    cookie_path: str = "/"
    cookie_max_age: int = 60 * 60 * 24 * 365
    cookie_httponly: bool = True
    cookie_samesite: str = "lax"
    cookie_secure: bool = False


class AnonymousUserMiddleware(BaseHTTPMiddleware):
    """
    Middleware for generating and managing unique  identifiers for anonymous users.

    Checks for the presence of the "anonymous_id" cookie in the request, if the user is not authorized.
    If the cookie is missing, generates a new UUID and sets it in the response cookie.
    Saves anonymous_id in request.state for access in request handlers.
    """

    def __init__(
        self,
        app: ASGIApp,
        config: AnonymousUserMiddlewareConfig,
    ) -> None:
        super().__init__(app)
        self.config = config

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        is_authenticated = "authorization" in request.headers
        set_anonymous_cookie = False
        if not is_authenticated:
            anonymous_id = request.cookies.get(self.config.cookie_name)

            if not anonymous_id:
                async with container() as request_container:
                    uow = await request_container.get(SQLAlchemyUnitOfWork)
                    anonymous_user_service = await request_container.get(AnonymousUserService)
                    try:
                        async with uow:
                            anonymous_user = await anonymous_user_service.create(
                                AnonymousUserCreate(
                                    cookie_id=anonymous_id, user_agent=request.headers.get("user-agent")
                                )
                            )
                            anonymous_id = anonymous_user.cookie_id
                            await uow.commit()
                    except Exception:
                        logger.exception("Error when creating anonymous user in middleware")
                    else:
                        set_anonymous_cookie = True
                        request.state.anonymous_cookie_id = anonymous_id

        response = await call_next(request)

        if not is_authenticated and set_anonymous_cookie:
            response.set_cookie(
                key=self.config.cookie_name,
                value=request.state.anonymous_cookie_id,
                max_age=self.config.cookie_max_age,
                httponly=self.config.cookie_httponly,
                samesite=self.config.cookie_samesite,
                secure=self.config.cookie_secure,
                path=self.config.cookie_path,
            )

        return response
