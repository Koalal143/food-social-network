"""Make source nullable

Revision ID: 4a5f192891de
Revises: 2581b150eff5
Create Date: 2025-05-29 22:00:47.567418

"""

from collections.abc import Sequence

from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "4a5f192891de"
down_revision: str | None = "ea46786ac9e2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "user_impression",
        "source",
        existing_type=postgresql.ENUM(
            "search", "feed", "recs", "recs_detail", "favorites", "author_page", "shared", name="impression_source_enum"
        ),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "user_impression",
        "source",
        existing_type=postgresql.ENUM(
            "search", "feed", "recs", "recs_detail", "favorites", "author_page", "shared", name="impression_source_enum"
        ),
        nullable=False,
    )
