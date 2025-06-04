from collections.abc import Callable

from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from src.api import v1_router
from src.core.config import Settings, settings
from src.core.di import container
from src.core.exception_handlers import http_exception_handler, request_validation_error_handler
from src.core.lifespan import lifespan
from src.exceptions.http import AppHTTPException
from src.utils.examples_factory import json_example_factory


def create_app(app_settings: Settings, app_lifespan: Callable) -> FastAPI:
    app = FastAPI(
        title=app_settings.project_name,
        description="API for Food Social Network",
        version="1.0.0",
        lifespan=app_lifespan,
        debug=app_settings.mode == "dev",
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

    app.add_exception_handler(AppHTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, request_validation_error_handler)  # type: ignore[arg-type]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.server.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Total-Count"],
    )

    app.include_router(v1_router)

    return app


app = create_app(app_settings=settings, app_lifespan=lifespan)

setup_dishka(container=container, app=app)
