"""Add anonymous user model

Revision ID: c9c646c16cb9
Revises: 6b97f92a6e36
Create Date: 2025-05-27 05:23:35.550791

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c9c646c16cb9"
down_revision: str | None = "6b97f92a6e36"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "anonymous_users",
        sa.Column("cookie_id", sa.UUID(), nullable=False),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_anonymous_users")),
    )
    op.create_index(op.f("ix_anonymous_users_cookie_id"), "anonymous_users", ["cookie_id"], unique=True)
    op.create_index("ix_anonymous_users_created_at", "anonymous_users", ["created_at"], unique=False)
    op.create_index(op.f("ix_anonymous_users_id"), "anonymous_users", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_anonymous_users_id"), table_name="anonymous_users")
    op.drop_index("ix_anonymous_users_created_at", table_name="anonymous_users")
    op.drop_index(op.f("ix_anonymous_users_cookie_id"), table_name="anonymous_users")
    op.drop_table("anonymous_users")
