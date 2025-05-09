from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.enums.recipe_difficulty import RecipeDifficultyEnum
from src.models.base import Base

if TYPE_CHECKING:
    from src.models.recipe_ingredient import RecipeIngredient
    from src.models.recipe_instructions import RecipeInstruction
    from src.models.recipe_tag import RecipeTag
    from src.models.user import User


class Recipe(Base):
    __tablename__ = "recipes"

    title: Mapped[str] = mapped_column(String(135), nullable=False)
    author_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    short_description: Mapped[str] = mapped_column(String(255), nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[RecipeDifficultyEnum]
    cook_time_minutes: Mapped[int]
    is_published: Mapped[bool] = mapped_column(default=False)

    author: Mapped["User"] = relationship(back_populates="recipes")
    ingredients: Mapped[list["RecipeIngredient"]] = relationship(back_populates="recipe")
    instructions: Mapped[list["RecipeInstruction"]] = relationship(back_populates="recipe")
    tags: Mapped[list["RecipeTag"]] = relationship(back_populates="recipe")
