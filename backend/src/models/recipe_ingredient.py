from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.recipe import Recipe


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    name: Mapped[str] = mapped_column(String(135), nullable=False)
    quantity: Mapped[str] = mapped_column(String(135), nullable=True)

    recipe: Mapped["Recipe"] = relationship(back_populates="ingredients")
