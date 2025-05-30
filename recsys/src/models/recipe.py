from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base


class Recipe(Base):
    __tablename__ = "recipes"

    author_id: Mapped[int] = mapped_column(nullable=False)
