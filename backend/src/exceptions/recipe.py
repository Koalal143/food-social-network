from src.exceptions.base import BaseAppError


class RecipeNotFoundError(BaseAppError):
    error_key = "recipe_not_found"


class RecipeOwnershipError(BaseAppError):
    error_key = "recipe_belongs_to_other_user"


class NoRecipeImageError(BaseAppError):
    error_key = "image_required_to_publish"


class NoRecipeInstructionsError(BaseAppError):
    error_key = "instructions_required_to_publish"


class AttachInstructionStepError(BaseAppError):
    error_key = "attach_instruction_step"
