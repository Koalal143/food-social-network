import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import UUID

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.consent import Consent
    from src.models.recipe_impression import RecipeImpression
    from src.models.search_query import SearchQuery


class AnonymousUser(Base):
    __tablename__ = "anonymous_users"

    cookie_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), unique=True, nullable=False, default=uuid.uuid4, index=True
    )
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recipe_impressions: Mapped[list["RecipeImpression"]] = relationship(
        back_populates="anonymous_user", cascade="all, delete-orphan"
    )
    consent: Mapped["Consent"] = relationship(back_populates="anonymous_user", uselist=False)
    search_queries: Mapped[list["SearchQuery"]] = relationship(back_populates="anonymous_user")

    __table_args__ = (Index("ix_anonymous_users_created_at", "created_at"),)
