from src.exceptions.base import BaseAppError


class RecipeNotFoundError(BaseAppError):
    error_key = "recipe_not_found"



class RecipeOwnershipError(BaseAppError):
    error_key = "recipe_belongs_to_other_user"



class NoRecipeImageError(BaseAppError):
    error_key = "image_is_required_to_publish_recipe"
