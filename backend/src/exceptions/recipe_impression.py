from src.exceptions.base import BaseAppError


class RecipeImpressionAlreadyExistsError(BaseAppError):
    error_key = "recipe_impression_already_exists"


class RecipeImpressionNotFoundError(BaseAppError):
    error_key = "recipe_impression_not_found"
