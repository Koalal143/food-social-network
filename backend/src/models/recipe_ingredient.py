from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.recipe import Recipe
    from src.models.shopping_list_item import ShoppingListItem


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(135), nullable=False)
    quantity: Mapped[str] = mapped_column(String(135), nullable=True)

    recipe: Mapped["Recipe"] = relationship(back_populates="ingredients")
    shopping_list_items: Mapped[list["ShoppingListItem"]] = relationship(back_populates="recipe_ingredient")
