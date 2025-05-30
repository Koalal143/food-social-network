"""Add user impression model

Revision ID: ea46786ac9e2
Revises: ff8cfc59f6b3
Create Date: 2025-05-28 23:38:39.191712

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ea46786ac9e2"
down_revision: str | None = "ff8cfc59f6b3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "user_impression",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("recipe_id", sa.Integer(), nullable=False),
        sa.Column(
            "source",
            sa.Enum(
                "search",
                "feed",
                "recs",
                "recs_detail",
                "favorites",
                "author_page",
                "shared",
                name="impression_source_enum",
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("user_impression")
