from pydantic import BaseModel, PositiveInt

from src.schemas.base import BaseSchema
from src.schemas.recipe import RecipeReadShort


class DislikedRecipeRead(BaseSchema):
    user_id: int
    recipe: RecipeReadShort


class DislikedRecipeCreate(BaseModel):
    recipe_id: PositiveInt
