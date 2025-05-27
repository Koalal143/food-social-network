from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.disliked_recipes import DislikedRecipe
    from src.models.favorite_recipes import FavoriteRecipe
    from src.models.recipe import Recipe
    from src.models.recipe_impression import RecipeImpression
    from src.models.token import RefreshToken
    from src.models.user_profile import UserProfile


class User(Base):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)
    is_superuser: Mapped[bool] = mapped_column(default=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(back_populates="user")
    profile: Mapped["UserProfile"] = relationship(back_populates="user", uselist=False)
    recipes: Mapped[list["Recipe"]] = relationship(back_populates="author")
    recipe_impressions: Mapped[list["RecipeImpression"]] = relationship(back_populates="user")
    favorite_recipes: Mapped[list["FavoriteRecipe"]] = relationship(back_populates="user")
    disliked_recipes: Mapped[list["DislikedRecipe"]] = relationship(back_populates="user")
