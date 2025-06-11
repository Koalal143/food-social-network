from src.exceptions.base import BaseAppError


class RecipeReportNotFoundError(BaseAppError):
    error_key = "recipe_report_not_found"


class RecipeReportAlreadyExistsError(BaseAppError):
    error_key = "recipe_report_already_exists"


class CannotReportOwnRecipeError(BaseAppError):
    error_key = "cannot_report_own_recipe"
