from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base


class BannedEmail(Base):
    __tablename__ = "banned_emails"

    domain: Mapped[str] = mapped_column(unique=True)
