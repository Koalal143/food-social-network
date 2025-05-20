from src.exceptions.base import BaseAppError


class RecipeIngredientNotFoundError(BaseAppError):
    error_key = "recipe_ingredient_not_found"
