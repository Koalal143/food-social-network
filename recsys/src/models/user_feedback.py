import enum

from sqlalchemy import DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base


class FeedbackType(enum.Enum):
    like = "like"
    dislike = "dislike"


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    user_id: Mapped[int] = mapped_column(nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    feedback_type: Mapped[FeedbackType] = mapped_column(Enum(FeedbackType, name="feedback_type_enum"), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
