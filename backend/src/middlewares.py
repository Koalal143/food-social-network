import uuid
from collections.abc import Callable

from fastapi import Request, Response
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


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
        is_authenticated = "Authorization" in request.headers

        if not is_authenticated:
            anonymous_id = request.cookies.get(self.config.cookie_name)

            if not anonymous_id:
                anonymous_id = str(uuid.uuid4())
                request.state.set_anonymous_cookie = True

            request.state.anonymous_id = anonymous_id
        else:
            request.state.anonymous_id = None
            request.state.set_anonymous_cookie = False

        response = await call_next(request)

        if not is_authenticated and getattr(request.state, "set_anonymous_cookie", False):
            response.set_cookie(
                key=self.config.cookie_name,
                value=request.state.anonymous_id,
                max_age=self.config.cookie_max_age,
                httponly=self.config.cookie_httponly,
                samesite=self.config.cookie_samesite,
                secure=self.config.cookie_secure,
                path=self.config.cookie_path,
            )

        return response
