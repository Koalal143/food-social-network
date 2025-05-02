from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from src.api import v1_router
from src.core.config import settings
from src.core.exception_handlers import http_exception_handler, request_validation_error_handler
from src.core.lifespan import lifespan
from src.exceptions.http import AppHTTPException

app = FastAPI(
    title=settings.project_name,
    description="API for Food Social Network",
    version="1.0.0",
    lifespan=lifespan,
    debug=settings.mode == "dev",
)

app.add_exception_handler(AppHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, request_validation_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.server.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)
