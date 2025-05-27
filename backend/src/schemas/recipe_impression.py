from pydantic import Field

from src.enums.recipe_get_source import RecipeGetSourceEnum
from src.schemas.base import BaseSchema
from src.schemas.recipe import RecipeReadShort


class RecipeImpressionRead(BaseSchema):
    recipe: RecipeReadShort
    source: RecipeGetSourceEnum | None = Field(default=None, description="Source of the impression")
