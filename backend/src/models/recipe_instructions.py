from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.recipe import Recipe


class RecipeInstruction(Base):
    __tablename__ = "recipe_instructions"

    recipe_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    step_number: Mapped[int]
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    image_url: Mapped[str | None] = mapped_column(nullable=True)

    recipe: Mapped["Recipe"] = relationship(back_populates="instructions")
