"""add banned emails model

Revision ID: 30c9f797f0f3
Revises: 1ad550d1cc21
Create Date: 2025-05-06 19:22:14.083116

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "30c9f797f0f3"
down_revision: str | None = "1ad550d1cc21"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "banned_emails",
        sa.Column("domain", sa.String(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("domain"),
    )
    op.create_index(op.f("ix_banned_emails_id"), "banned_emails", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_banned_emails_id"), table_name="banned_emails")
    op.drop_table("banned_emails")
