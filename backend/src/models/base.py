import datetime

from sqlalchemy import Mapped, mapped_column
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        default=lambda: datetime.datetime.now(datetime.UTC), nullable=True
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        default=lambda: datetime.datetime.now(datetime.UTC),
        onupdate=lambda: datetime.datetime.now(datetime.UTC),
        nullable=True,
    )

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.id})>"
