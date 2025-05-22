from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.recipe import Recipe
    from src.models.user import User


class DislikedRecipe(Base):
    __tablename__ = "disliked_recipes"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"))

    user: Mapped["User"] = relationship(back_populates="disliked_recipes")
    recipe: Mapped["Recipe"] = relationship(back_populates="disliked_recipes")
