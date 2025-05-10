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
from src.exceptions.recipe import (
    AttachInstructionStepError,
    NoRecipeImageError,
    RecipeNotFoundError,
    RecipeOwnershipError,
)
from src.exceptions.user import UserEmailAlreadyExistsError, UserNicknameAlreadyExistsError, UserNotFoundError

__all__ = [
    "AppHTTPException",
    "AttachInstructionStepError",
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
    "NoRecipeImageError",
    "RecipeNotFoundError",
    "RecipeOwnershipError",
    "UserEmailAlreadyExistsError",
    "UserNicknameAlreadyExistsError",
    "UserNotFoundError",
    "WrongImageFormatError",
]
