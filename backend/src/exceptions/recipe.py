from src.exceptions.base import BaseAppError


class RecipeNotFoundError(BaseAppError):
    error_key = "recipe_not_found"



class RecipeOwnershipError(BaseAppError):
    error_key = "recipe_belongs_to_other_user"
