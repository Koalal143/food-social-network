from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.enums.report_reason import ReportReasonEnum
from src.enums.report_status import ReportStatusEnum
from src.models.base import Base

if TYPE_CHECKING:
    from src.models.recipe import Recipe
    from src.models.user import User


class RecipeReport(Base):
    __tablename__ = "recipe_reports"
    __table_args__ = (
        Index("ix_recipe_reports_recipe_id", "recipe_id"),
        Index("ix_recipe_reports_reporter_user_id", "reporter_user_id"),
        Index("ix_recipe_reports_status", "status"),
        Index("ix_recipe_reports_created_at", "created_at"),
        UniqueConstraint("recipe_id", "reporter_user_id", name="uq_recipe_reports_recipe_reporter"),
    )

    recipe_id: Mapped[int | None] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=True)
    reporter_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason: Mapped[ReportReasonEnum] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[ReportStatusEnum] = mapped_column(default=ReportStatusEnum.PENDING, nullable=False)
    reviewed_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    admin_notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    recipe: Mapped["Recipe"] = relationship("Recipe")
    reporter_user: Mapped["User | None"] = relationship("User", foreign_keys=[reporter_user_id])
    reviewed_by_user: Mapped["User | None"] = relationship("User", foreign_keys=[reviewed_by_user_id])
