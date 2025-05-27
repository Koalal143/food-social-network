"""Add search query model

Revision ID: 45fe968dcd0e
Revises: 76a67458161f
Create Date: 2025-05-27 18:00:59.790889

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "45fe968dcd0e"
down_revision: str | None = "76a67458161f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "search_queries",
        sa.Column("anonymous_user_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("query", sa.String(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["anonymous_user_id"],
            ["anonymous_users.id"],
            name=op.f("fk_search_queries_anonymous_user_id_anonymous_users"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_search_queries_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_search_queries")),
    )
    op.create_index(op.f("ix_search_queries_id"), "search_queries", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_search_queries_id"), table_name="search_queries")
    op.drop_table("search_queries")
