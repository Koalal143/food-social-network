from typing import TYPE_CHECKING

from sqlalchemy import ColumnElement, ForeignKey, case
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.recipe import Recipe
    from src.models.recipe_ingredient import RecipeIngredient
    from src.models.user import User


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str]
    quantity: Mapped[str | None] = mapped_column(default=None, nullable=True)
    recipe_id: Mapped[int | None] = mapped_column(ForeignKey("recipes.id", ondelete="SET NULL"))
    recipe_ingredient_id: Mapped[int | None] = mapped_column(ForeignKey("recipe_ingredients.id", ondelete="SET NULL"))
    is_purchased: Mapped[bool] = mapped_column(default=False)
    is_from_recipe: Mapped[bool] = mapped_column(default=False)

    @hybrid_property
    def is_actual(self) -> bool:
        if not self.is_from_recipee:
            return True
        return self.recipe_id is not None and self.recipe_ingredient_id is not None

    @is_actual.inplace.expression
    @classmethod
    def _is_actual_expression(cls) -> ColumnElement[bool]:
        return case(
            (cls.is_from_recipe.is_(False), True),
            else_=(cls.recipe_id.is_not(None) & cls.recipe_ingredient_id.is_not(None))
        )

    user: Mapped["User"] = relationship(back_populates="shopping_list_items")
    recipe: Mapped["Recipe"] = relationship(back_populates="shopping_list_items")
    recipe_ingredient: Mapped["RecipeIngredient"] = relationship(back_populates="shopping_list_items")
