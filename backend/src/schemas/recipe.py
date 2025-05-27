from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, PositiveInt

from src.enums.recipe_difficulty import RecipeDifficultyEnum
from src.schemas.base import BaseReadSchema, BaseSchema
from src.schemas.direct_upload import DirectUpload
from src.schemas.user import UserReadShort
from src.utils.partial_model import partial_model
from src.utils.validators import validate_recipe_title

MAX_RECIPE_INSTRUCTIONS_COUNT = 25

RecipeTitle = Annotated[
    str,
    Field(max_length=135, examples=["Pasta Carbonara", "Салат Цезарь"]),
    AfterValidator(validate_recipe_title),
]


class Ingredient(BaseSchema):
    name: str = Field(max_length=135, examples=["Tomato", "Чеснок"])
    quantity: str = Field(max_length=135, examples=["2 pieces", "два зубчика"])


@partial_model
class IngredientUpdate(Ingredient):
    pass


class RecipeInstruction(BaseSchema):
    step_number: PositiveInt = Field(le=MAX_RECIPE_INSTRUCTIONS_COUNT)
    description: str = Field(max_length=1000, examples=["Boil water", "Добавьте соль"])
    image_url: str | None = Field(default=None)


@partial_model
class RecipeInstructionUpdate(RecipeInstruction):
    pass


class RecipeInstructionsUploadUrls(DirectUpload):
    step_number: PositiveInt


class RecipeTag(BaseSchema):
    name: str = Field(max_length=50, examples=["Dinner", "Африканская кухня"])


@partial_model
class RecipeTagUpdate(RecipeTag):
    pass


class BaseRecipeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    title: RecipeTitle
    short_description: str = Field(max_length=255, examples=["Рецепт салата Цезарь"])
    image_url: str | None = Field(None, max_length=255, examples=["https://example.com/image.jpg"])
    difficulty: RecipeDifficultyEnum = Field(examples=["EASY"])
    cook_time_minutes: int = Field(gt=0)


class _InstructionsMixin(BaseSchema):
    instructions: list[RecipeInstruction] | None = Field(default=None, max_length=MAX_RECIPE_INSTRUCTIONS_COUNT)


class _IngredientsMixin(BaseSchema):
    ingredients: list[Ingredient] = Field(max_length=50)


class _TagsMixin(BaseSchema):
    tags: list[RecipeTag] = Field(max_length=15)


class _IsPublishedMixin(BaseSchema):
    is_published: bool = Field(default=False, description="Is the recipe published or not")


class RecipeReadShort(BaseRecipeSchema):
    id: PositiveInt
    is_on_favorites: bool = Field(default=False, description="Is the recipe in user's favorites")
    slug: str = Field(description="Recipe slug for URL")


class RecipeRead(_InstructionsMixin, _IngredientsMixin, _TagsMixin, _IsPublishedMixin, RecipeReadShort, BaseReadSchema):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True, extra="ignore")


class RecipeReadFull(RecipeRead):
    author: UserReadShort


class RecipeCreate(_InstructionsMixin, _IngredientsMixin, _TagsMixin, BaseRecipeSchema):
    pass


@partial_model
class RecipeUpdate(_IsPublishedMixin, BaseRecipeSchema):
    instructions: list[RecipeInstructionUpdate]
    ingredients: list[IngredientUpdate]
    tags: list[RecipeTagUpdate]


class RecipeSearchQuery(BaseModel):
    limit: int | None = Field(default=0, gte=0, lte=50)
    offset: int | None = Field(default=0, gte=0)
    query: str | None = Field(default=None, description="Query for searching by title and short_description fields")
    tags: list[str] | None = Field(default=None)
    include_ingredients: list[str] | None = Field(default=None)
    exclude_ingredients: list[str] | None = Field(default=None)
    cook_time_from: int | None = Field(default=None, ge=0)
    cook_time_to: int | None = Field(default=None, ge=0)
    sort_by: Literal["-created_at", "created_at"] | None = Field(default=None)
