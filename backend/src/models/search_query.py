from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.anonymous_user import AnonymousUser
    from src.models.user import User


class SearchQuery(Base):
    __tablename__ = "search_queries"
    __table_args__ = (UniqueConstraint("anonymous_user_id", "query"), UniqueConstraint("user_id", "query"))

    anonymous_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("anonymous_users.id", ondelete="CASCADE"), nullable=True
    )
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    query: Mapped[str] = mapped_column(nullable=False)

    anonymous_user: Mapped["AnonymousUser"] = relationship(back_populates="search_queries")
    user: Mapped["User"] = relationship(back_populates="search_queries")
