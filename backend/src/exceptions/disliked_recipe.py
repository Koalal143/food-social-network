from src.exceptions.base import BaseAppError


class RecipeAlreadyDislikedError(BaseAppError):
    error_key = "recipe_already_disliked"


class RecipeNotDislikedError(BaseAppError):
    error_key = "recipe_not_disliked"
