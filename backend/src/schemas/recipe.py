from pydantic import BaseModel, ConfigDict, Field, PositiveInt

from src.enums.recipe_difficulty import RecipeDifficultyEnum
from src.schemas.base import BaseReadSchema, BaseSchema
from src.schemas.direct_upload import DirectUpload
from src.schemas.user import UserReadShort
from src.utils.partial_model import partial_model


class Ingredient(BaseSchema):
    name: str = Field(max_length=135, examples=["Tomato", "Чеснок"])
    quantity: str = Field(max_length=135, examples=["2 pieces", "два зубчика"])


@partial_model
class IngredientUpdate(Ingredient):
    pass


class RecipeInstruction(BaseSchema):
    step_number: PositiveInt = Field(le=25)
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

    title: str = Field(max_length=135, examples=["Pasta Carbonara", "Салат Цезарь"])
    short_description: str = Field(max_length=255, examples=["Рецепт салата Цезарь"])
    image_url: str | None = Field(None, max_length=255, examples=["https://example.com/image.jpg"])
    difficulty: RecipeDifficultyEnum = Field(examples=["EASY"])
    cook_time_minutes: int = Field(gt=0)


class _InstructionsMixin(BaseSchema):
    instructions: list[RecipeInstruction] | None = Field(default=None, max_length=25)


class _IngredientsMixin(BaseSchema):
    ingredients: list[Ingredient]


class _TagsMixin(BaseSchema):
    tags: list[RecipeTag]


class _IsPublishedMixin(BaseSchema):
    is_published: bool = Field(default=False, description="Is the recipe published or not")



class RecipeReadShort(BaseRecipeSchema):
    pass


class RecipeRead(
    _InstructionsMixin, _IngredientsMixin, _TagsMixin, _IsPublishedMixin, BaseRecipeSchema, BaseReadSchema
):
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
