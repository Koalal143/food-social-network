import enum

from sqlalchemy import DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base


class ImpressionSource(enum.Enum):
    search = "search"
    feed = "feed"
    recs = "recs"
    recs_detail = "recs-detail"
    favorites = "favorites"
    author_page = "author-page"
    shared = "shared"


class UserImpression(Base):
    __tablename__ = "user_impression"

    user_id: Mapped[int] = mapped_column(nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    source: Mapped[ImpressionSource | None] = mapped_column(
        Enum(ImpressionSource, name="impression_source_enum"), nullable=True
    )
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
