from fastapi import Request
from fastapi.responses import JSONResponse

from src.exceptions.http import AppHTTPException


def http_exception_handler(request: Request, exc: AppHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_key": exc.error_key},
    )
