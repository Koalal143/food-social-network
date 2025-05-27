from src.exceptions.base import BaseAppError


class ConsentNotFoundError(BaseAppError):
    error_key = "consent_not_found"
