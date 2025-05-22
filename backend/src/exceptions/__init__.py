from src.exceptions.auth import (
    InactiveOrNotExistingUserError,
    IncorrectCredentialsError,
    InvalidJWTError,
    InvalidTokenError,
    JWTSignatureExpiredError,
)
from src.exceptions.banned_email import EmailDomainAlreadyBannedError
from src.exceptions.base import BaseAppError
from src.exceptions.disliked_recipe import RecipeAlreadyDislikedError, RecipeNotDislikedError
from src.exceptions.favorite_recipe import RecipeAlreadyInFavoritesError, RecipeNotInFavoritesError
from src.exceptions.http import AppHTTPException
from src.exceptions.image import ImageTooLargeError, WrongImageFormatError
from src.exceptions.recipe import (
    AttachInstructionStepError,
    NoRecipeImageError,
    NoRecipeInstructionsError,
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
    "NoRecipeInstructionsError",
    "RecipeAlreadyDislikedError",
    "RecipeAlreadyInFavoritesError",
    "RecipeNotDislikedError",
    "RecipeNotFoundError",
    "RecipeNotInFavoritesError",
    "RecipeOwnershipError",
    "UserEmailAlreadyExistsError",
    "UserNicknameAlreadyExistsError",
    "UserNotFoundError",
    "WrongImageFormatError",
]
