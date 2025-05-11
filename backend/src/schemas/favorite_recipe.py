from pydantic import BaseModel

from src.schemas.base import BaseReadSchema
from src.schemas.recipe import RecipeReadShort


class FavoriteRecipeRead(BaseReadSchema):
    user_id: int
    recipe: RecipeReadShort


class FavoriteRecipeCreate(BaseModel):
    recipe_id: int
