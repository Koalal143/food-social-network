from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.enums.recipe_get_source import RecipeGetSourceEnum
from src.models.base import Base

if TYPE_CHECKING:
    from src.models.anonymous_user import AnonymousUser
    from src.models.recipe import Recipe
    from src.models.user import User


class RecipeImpression(Base):
    __tablename__ = "recipe_impressions"

    anonymous_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("anonymous_users.id", ondelete="CASCADE"), nullable=True
    )
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"))
    source: Mapped[RecipeGetSourceEnum | None] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship(back_populates="recipe_impressions")
    recipe: Mapped["Recipe"] = relationship(back_populates="recipe_impressions")
    anonymous_user: Mapped["AnonymousUser"] = relationship(back_populates="recipe_impressions")
