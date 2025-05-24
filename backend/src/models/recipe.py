from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.enums.recipe_difficulty import RecipeDifficultyEnum
from src.models.base import Base

if TYPE_CHECKING:
    from src.models.disliked_recipes import DislikedRecipe
    from src.models.favorite_recipes import FavoriteRecipe
    from src.models.recipe_ingredient import RecipeIngredient
    from src.models.recipe_instructions import RecipeInstruction
    from src.models.recipe_tag import RecipeTag
    from src.models.user import User


class Recipe(Base):
    __tablename__ = "recipes"
    __table_args__ = (
        Index("ix_recipes_slug", "slug"),
    )

    title: Mapped[str] = mapped_column(String(135), nullable=False)
    slug: Mapped[str] = mapped_column(String(110), nullable=False, unique=True)
    author_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    short_description: Mapped[str] = mapped_column(String(255), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    difficulty: Mapped[RecipeDifficultyEnum]
    cook_time_minutes: Mapped[int]
    is_published: Mapped[bool] = mapped_column(default=False)

    author: Mapped["User"] = relationship(back_populates="recipes")
    ingredients: Mapped[list["RecipeIngredient"]] = relationship(back_populates="recipe")
    instructions: Mapped[list["RecipeInstruction"]] = relationship(back_populates="recipe")
    tags: Mapped[list["RecipeTag"]] = relationship(back_populates="recipe")
    favorite_recipes: Mapped[list["FavoriteRecipe"]] = relationship(back_populates="recipe")
    disliked_recipes: Mapped[list["DislikedRecipe"]] = relationship(back_populates="recipe")
