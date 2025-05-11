from src.exceptions.base import BaseAppError


class RecipeAlreadyInFavoritesError(BaseAppError):
    error_key = "recipe_already_in_favorites"


class RecipeNotInFavoritesError(BaseAppError):
    error_key = "recipe_not_in_favorites"
