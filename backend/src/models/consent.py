from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.anonymous_user import AnonymousUser


class Consent(Base):
    __tablename__ = "consents"

    anonymous_user_id: Mapped[int] = mapped_column(ForeignKey("anonymous_users.id", ondelete="CASCADE"), unique=True)
    is_analytics_allowed: Mapped[bool] = mapped_column(default=False)

    anonymous_user: Mapped["AnonymousUser"] = relationship(back_populates="consent")
