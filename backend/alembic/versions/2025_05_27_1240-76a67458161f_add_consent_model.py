"""Add consent model

Revision ID: 76a67458161f
Revises: a4b7bc0e6ef7
Create Date: 2025-05-27 12:40:31.490054

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "76a67458161f"
down_revision: str | None = "a4b7bc0e6ef7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "consents",
        sa.Column("anonymous_user_id", sa.Integer(), nullable=False),
        sa.Column("is_analytics_allowed", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["anonymous_user_id"],
            ["anonymous_users.id"],
            name=op.f("fk_consents_anonymous_user_id_anonymous_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_consents")),
        sa.UniqueConstraint("anonymous_user_id", name=op.f("uq_consents_anonymous_user_id")),
    )
    op.create_index(op.f("ix_consents_id"), "consents", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consents_id"), table_name="consents")
    op.drop_table("consents")
