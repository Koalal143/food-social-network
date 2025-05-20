from pydantic import BaseModel, ConfigDict, Field

from src.schemas.base import BaseReadSchema, BaseSchema
from src.utils.partial_model import partial_model


class ShoppingListItemBase(BaseSchema):
    name: str = Field(examples=["Молоко"])
    quantity: str = Field(examples=["1 литр"])


class ShoppingListItemCreate(ShoppingListItemBase):
    model_config = ConfigDict(extra="forbid")

    recipe_ingredient_id: int | None = Field(default=None)


class ShoppingListRecipe(BaseSchema):
    id: int
    title: str


class ShoppingListItemRead(ShoppingListItemBase, BaseReadSchema):
    is_actual: bool = Field(default=True)
    is_purchased: bool = Field(default=False)
    recipe: ShoppingListRecipe | None = Field(default=None)


@partial_model
class ShoppingListItemUpdate(ShoppingListItemBase):
    model_config = ConfigDict(extra="forbid")

    is_purchased: bool | None = Field(default=None)


class ShoppingListItemToggle(BaseModel):
    item_id: int = Field(description="ID of the shopping list item to toggle")


class ShoppingListItemBulkCreate(BaseModel):
    items: list[ShoppingListItemCreate] = Field(max_length=25)
