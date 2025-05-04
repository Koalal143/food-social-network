from src.exceptions.base import BaseAppError


class JWTSignatureExpiredError(BaseAppError):
    error_key = "jwt_signature_expired"


class InvalidJWTError(BaseAppError):
    error_key = "invalid_jwt"


class InvalidTokenError(BaseAppError):
    error_key = "invalid_token"


class InactiveOrNotExistingUserError(BaseAppError):
    error_key = "user_inactive_or_does_not_exists"
