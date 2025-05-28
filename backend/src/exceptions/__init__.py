from src.exceptions.anonymous_user import AnonymousUserDoesNotExistError
from src.exceptions.auth import (
    InactiveOrNotExistingUserError,
    IncorrectCredentialsError,
    InvalidJWTError,
    InvalidTokenError,
    JWTSignatureExpiredError,
)
from src.exceptions.banned_email import EmailDomainAlreadyBannedError
from src.exceptions.base import BaseAppError
from src.exceptions.consent import ConsentNotFoundError
from src.exceptions.disliked_recipe import RecipeAlreadyDislikedError, RecipeNotDislikedError
from src.exceptions.favorite_recipe import RecipeAlreadyInFavoritesError, RecipeNotInFavoritesError
from src.exceptions.http import AppHTTPException
from src.exceptions.image import ImageTooLargeError, WrongImageFormatError
from src.exceptions.recipe import (
    AttachInstructionStepError,
    InstructionNotBelongsToRecipeError,
    NoRecipeImageError,
    NoRecipeInstructionsError,
    RecipeNotFoundError,
    RecipeOwnershipError,
)
from src.exceptions.recipe_search import UserIdentityNotProvidedError
from src.exceptions.user import UserEmailAlreadyExistsError, UserNicknameAlreadyExistsError, UserNotFoundError

__all__ = [
    "AnonymousUserDoesNotExistError",
    "AppHTTPException",
    "AttachInstructionStepError",
    "BannedEmailError",
    "BaseAppError",
    "ConsentNotFoundError",
    "EmailDomainAlreadyBannedError",
    "ImageTooLargeError",
    "InactiveOrNotExistingUserError",
    "IncorrectCredentialsError",
    "InstructionNotBelongsToRecipeError",
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
    "UserIdentityNotProvidedError",
    "UserNicknameAlreadyExistsError",
    "UserNotFoundError",
    "WrongImageFormatError",
]
