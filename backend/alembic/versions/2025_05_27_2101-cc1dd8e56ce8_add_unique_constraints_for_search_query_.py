"""Add unique constraints for search query fields

Revision ID: cc1dd8e56ce8
Revises: 45fe968dcd0e
Create Date: 2025-05-27 21:01:13.107179

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "cc1dd8e56ce8"
down_revision: str | None = "45fe968dcd0e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_unique_constraint(
        op.f("uq_search_queries_anonymous_user_id"), "search_queries", ["anonymous_user_id", "query"]
    )
    op.create_unique_constraint(op.f("uq_search_queries_user_id"), "search_queries", ["user_id", "query"])


def downgrade() -> None:
    op.drop_constraint(op.f("uq_search_queries_user_id"), "search_queries", type_="unique")
    op.drop_constraint(op.f("uq_search_queries_anonymous_user_id"), "search_queries", type_="unique")
