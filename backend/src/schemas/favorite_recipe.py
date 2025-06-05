from pydantic import BaseModel, PositiveInt

from src.schemas.base import BaseSchema
from src.schemas.recipe import RecipeReadShort


class FavoriteRecipeRead(BaseSchema):
    user_id: int
    recipe: RecipeReadShort


class FavoriteRecipeCreate(BaseModel):
    recipe_id: PositiveInt
