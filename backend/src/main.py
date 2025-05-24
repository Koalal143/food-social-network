from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from src.api import v1_router
from src.core.config import settings
from src.core.di import container
from src.core.exception_handlers import http_exception_handler, request_validation_error_handler
from src.core.lifespan import lifespan
from src.exceptions.http import AppHTTPException
from src.middlewares import AnonymousUserMiddleware, AnonymousUserMiddlewareConfig
from src.utils.examples_factory import json_example_factory

app = FastAPI(
    title=settings.project_name,
    description="API for Food Social Network",
    version="1.0.0",
    lifespan=lifespan,
    debug=settings.mode == "dev",
    responses={
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "content": json_example_factory(
                {
                    "detail": [{"loc": ["string", 0], "msg": "string", "type": "string"}],
                    "error_key": "validation_error",
                    "body": {"string": "string"},
                },
            )
        }
    },
)

setup_dishka(container=container, app=app)

app.add_exception_handler(AppHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, request_validation_error_handler)

anonymous_config = AnonymousUserMiddlewareConfig(
    cookie_secure=settings.cookie_policy.secure,
    cookie_httponly=settings.cookie_policy.httponly,
    cookie_samesite=settings.cookie_policy.samesite,
)
app.add_middleware(AnonymousUserMiddleware, config=anonymous_config)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.server.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

app.include_router(v1_router)
