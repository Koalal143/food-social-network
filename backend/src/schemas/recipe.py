from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, HttpUrl, PositiveInt

from src.enums.recipe_difficulty import RecipeDifficultyEnum
from src.enums.recipe_sort_field import RecipeSortFieldEnum
from src.schemas.base import BaseReadSchema, BaseSchema
from src.schemas.direct_upload import DirectUpload
from src.schemas.user import UserReadShort
from src.utils.partial_model import partial_model
from src.utils.validators import validate_recipe_title

MAX_RECIPE_INSTRUCTIONS_COUNT = 25

RecipeTitle = Annotated[
    str,
    Field(min_length=3, max_length=135, examples=["Pasta Carbonara", "Салат Цезарь"]),
    AfterValidator(validate_recipe_title),
]


class BaseIngredient(BaseSchema):
    name: str = Field(min_length=2, max_length=135, examples=["Tomato", "Чеснок"])
    quantity: str | None = Field(default=None, max_length=30, examples=["2 pieces", "два зубчика"])


class IngredientCreate(BaseIngredient):
    pass


class IngredientRead(IngredientCreate):
    id: PositiveInt


class BaseRecipeInstruction(BaseSchema):
    step_number: PositiveInt = Field(le=MAX_RECIPE_INSTRUCTIONS_COUNT)
    description: str = Field(max_length=255, examples=["Boil water", "Добавьте соль"])
    image_path: str | None = Field(default=None, max_length=255, examples=["images/recipes/1/instructions/1/step.png"])


class RecipeInstruction(BaseRecipeInstruction):
    image_url: HttpUrl | None = Field(
        default=None, examples=["https://example.com/static/images/recipes/1/instructions/1/step.png"]
    )


class RecipeInstructionCreate(BaseRecipeInstruction):
    pass


def validate_instructions_steps(
    instructions: list[BaseRecipeInstruction] | None,
) -> list[BaseRecipeInstruction] | None:
    if instructions and [instruction.step_number for instruction in instructions] != list(
        range(1, len(instructions) + 1)
    ):
        msg = "Step numbers must be sequential starting from 1 with step equal to index + 1"
        raise ValueError(msg)

    return instructions


class RecipeInstructionsUploadUrls(DirectUpload):
    step_number: PositiveInt


class RecipeTag(BaseSchema):
    name: str = Field(min_length=2, max_length=50, examples=["Dinner", "Африканская кухня"])


class BaseRecipeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    title: RecipeTitle
    short_description: str = Field(min_length=3, max_length=255, examples=["Рецепт салата Цезарь"])
    difficulty: RecipeDifficultyEnum = Field(examples=["EASY"])
    cook_time_minutes: int = Field(gt=0)


class _IngredientsMixin(BaseSchema):
    ingredients: list[IngredientRead] = Field(min_length=1, max_length=50)


class _TagsMixin(BaseSchema):
    tags: list[RecipeTag] = Field(min_length=1, max_length=15)


class _IsPublishedMixin(BaseSchema):
    is_published: bool = Field(default=False, description="Is the recipe published or not")


class RecipeShort(BaseSchema):
    id: PositiveInt = Field(description="Recipe ID")
    slug: str = Field(description="Recipe slug for URL")


class RecipeReadShort(BaseRecipeSchema):
    id: PositiveInt
    image_url: str | None = Field(None, examples=["https://example.com/static/images/recipes/1/main.png"])
    impressions_count: int = Field(default=0, description="Count of impressions")
    is_on_favorites: bool = Field(default=False, description="Is the recipe in user's favorites")
    slug: str = Field(description="Recipe slug for URL")


class RecipeRead(_IngredientsMixin, _TagsMixin, _IsPublishedMixin, RecipeReadShort, BaseReadSchema):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True, extra="ignore")

    instructions: Annotated[list[RecipeInstruction] | None, AfterValidator(validate_instructions_steps)] = Field(
        default=None, max_length=MAX_RECIPE_INSTRUCTIONS_COUNT
    )


class RecipeReadFull(RecipeRead):
    author: UserReadShort


class RecipeCreate(_TagsMixin, BaseRecipeSchema):
    image_path: str | None = Field(default=None, max_length=255, examples=["images/recipes/1/main.png"])

    instructions: Annotated[list[RecipeInstructionCreate] | None, AfterValidator(validate_instructions_steps)] = Field(
        default=None, max_length=MAX_RECIPE_INSTRUCTIONS_COUNT
    )
    ingredients: list[IngredientCreate] = Field(min_length=1, max_length=50)


@partial_model
class RecipeUpdate(_IsPublishedMixin, BaseRecipeSchema):
    image_path: str | None = Field(default=None, max_length=255, examples=["images/recipes/1/main.png"])
    instructions: Annotated[list[RecipeInstructionCreate] | None, AfterValidator(validate_instructions_steps)] = Field(
        default=None, max_length=MAX_RECIPE_INSTRUCTIONS_COUNT
    )
    ingredients: list[IngredientCreate] | None = Field(default=None)
    tags: list[RecipeTag] | None = Field(default=None)


class RecipeSearchQuery(BaseModel):
    limit: int = Field(default=10, ge=0, le=50)
    offset: int | None = Field(default=0, ge=0)
    query: str | None = Field(default=None, description="Query for searching by title and short_description fields")
    tags: list[str] | None = Field(default=None)
    include_ingredients: list[str] | None = Field(default=None)
    exclude_ingredients: list[str] | None = Field(default=None)
    cook_time_from: int | None = Field(default=None, ge=0)
    cook_time_to: int | None = Field(default=None, ge=0)
    sort_by: Literal["-created_at", "created_at"] | None = Field(default=None)


class RecipeFilterParams(BaseModel):
    """Parameters for filtering and sorting recipes."""

    sort_by: RecipeSortFieldEnum | None = Field(
        default=None, description="Field and direction to sort by (e.g., 'created_at', '-impressions_count')"
    )
