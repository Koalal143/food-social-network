from src.exceptions.auth import (
    InactiveOrNotExistingUserError,
    IncorrectCredentialsError,
    InvalidJWTError,
    InvalidTokenError,
    JWTSignatureExpiredError,
)
from src.exceptions.banned_email import EmailDomainAlreadyBannedError
from src.exceptions.base import BaseAppError
from src.exceptions.http import AppHTTPException
from src.exceptions.image import ImageTooLargeError, WrongImageFormatError
from src.exceptions.recipe import RecipeNotFoundError
from src.exceptions.user import UserEmailAlreadyExistsError, UserNicknameAlreadyExistsError, UserNotFoundError

__all__ = [
    "AppHTTPException",
    "BannedEmailError",
    "BaseAppError",
    "EmailDomainAlreadyBannedError",
    "ImageTooLargeError",
    "InactiveOrNotExistingUserError",
    "IncorrectCredentialsError",
    "InvalidJWTError",
    "InvalidTokenError",
    "JWTSignatureExpired",
    "JWTSignatureExpiredError",
    "RecipeNotFoundError",
    "UserEmailAlreadyExistsError",
    "UserNicknameAlreadyExistsError",
    "UserNotFoundError",
    "WrongImageFormatError",
]
