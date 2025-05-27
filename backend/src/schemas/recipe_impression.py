from pydantic import BaseModel

from src.schemas.base import BaseSchema
from src.schemas.recipe import RecipeReadShort


class RecipeImpressionRead(BaseSchema):
    user_id: int | None
    anonymous_user_id: int | None
    recipe_id: int
    recipe: RecipeReadShort


class RecipeImpressionCreate(BaseModel):
    recipe_id: int


class RecipeImpressionCreateAnonymous(BaseModel):
    recipe_id: int
    anonymous_user_id: int
