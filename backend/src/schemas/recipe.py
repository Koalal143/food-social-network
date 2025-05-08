from pydantic import BaseModel, Field

from src.enums.recipe_difficulty import RecipeDifficultyEnum
from src.schemas.base import BaseReadSchema
from src.utils.partial_model import partial_model


class Ingredient(BaseModel):
    name: str = Field(max_length=135, examples=["Tomato", "Чеснок"])
    quantity: str = Field(max_length=135, examples=["2 pieces", "два зубчика"])


@partial_model
class IngredientUpdate(Ingredient):
    pass


class RecipeInstruction(BaseModel):
    step_number: int
    description: str = Field(max_length=1000, examples=["Boil water", "Добавьте соль"])
    image_url: str | None = Field(default=None)


@partial_model
class RecipeInstructionUpdate(RecipeInstruction):
    pass


class RecipeTag(BaseModel):
    name: str = Field(max_length=50, examples=["Dinner", "Африканская кухня"])


@partial_model
class RecipeTagUpdate(RecipeTag):
    pass


class BaseRecipeSchema(BaseModel):
    title: str = Field(max_length=135, examples=["Pasta Carbonara", "Салат Цезарь"])
    short_description: str = Field(max_length=255, examples=["Рецепт салата Цезарь"])
    image_url: str = Field(max_length=255, examples=["https://example.com/image.jpg"])
    difficulty: RecipeDifficultyEnum = Field(examples=["EASY"])
    cook_time_minutes: int = Field(gt=0)



class _InstructionsMixin(BaseModel):
    instructions: list[RecipeInstruction]


class _IngredientsMixin(BaseModel):
    ingredients: list[Ingredient]


class _TagsMixin(BaseModel):
    tags: list[RecipeTag]


class RecipeRead(_InstructionsMixin, _IngredientsMixin, _TagsMixin, BaseRecipeSchema, BaseReadSchema):
    pass


class RecipeCreate(_InstructionsMixin, _IngredientsMixin, _TagsMixin, BaseRecipeSchema):
    pass


@partial_model
class RecipeUpdate(BaseRecipeSchema):
    instructions: list[RecipeInstructionUpdate]
    ingredients: list[IngredientUpdate]
    tags: list[RecipeTagUpdate]
