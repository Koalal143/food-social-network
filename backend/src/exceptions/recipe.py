from src.exceptions.base import BaseAppError


class RecipeNotFoundError(BaseAppError):
    error_key = "recipe_not_found"
