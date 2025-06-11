"""Add recipe report model; add user role field

Revision ID: 79e4af494c04
Revises: b5501dadeb1b
Create Date: 2025-06-11 03:21:34.147774

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "79e4af494c04"
down_revision: str | None = "b5501dadeb1b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "recipe_reports",
        sa.Column("recipe_id", sa.Integer(), nullable=True),
        sa.Column("reporter_user_id", sa.Integer(), nullable=True),
        sa.Column(
            "reason",
            sa.Enum("SPAM", "INAPPROPRIATE_CONTENT", "COPYRIGHT", "FAKE_RECIPE", "OTHER", name="reportreasonenum"),
            nullable=False,
        ),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column(
            "status", sa.Enum("PENDING", "REVIEWED", "RESOLVED", "DISMISSED", name="reportstatusenum"), nullable=False
        ),
        sa.Column("reviewed_by_user_id", sa.Integer(), nullable=True),
        sa.Column("admin_notes", sa.String(length=1000), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["recipe_id"], ["recipes.id"], name=op.f("fk_recipe_reports_recipe_id_recipes"), ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["reporter_user_id"],
            ["users.id"],
            name=op.f("fk_recipe_reports_reporter_user_id_users"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["reviewed_by_user_id"],
            ["users.id"],
            name=op.f("fk_recipe_reports_reviewed_by_user_id_users"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_recipe_reports")),
        sa.UniqueConstraint("recipe_id", "reporter_user_id", name="uq_recipe_reports_recipe_reporter"),
    )
    op.create_index("ix_recipe_reports_created_at", "recipe_reports", ["created_at"], unique=False)
    op.create_index(op.f("ix_recipe_reports_id"), "recipe_reports", ["id"], unique=False)
    op.create_index("ix_recipe_reports_recipe_id", "recipe_reports", ["recipe_id"], unique=False)
    op.create_index("ix_recipe_reports_reporter_user_id", "recipe_reports", ["reporter_user_id"], unique=False)
    op.create_index("ix_recipe_reports_status", "recipe_reports", ["status"], unique=False)

    user_role_enum = postgresql.ENUM("USER", "ADMIN", "SUPERUSER", name="userroleenum", schema="public")
    user_role_enum.create(op.get_bind())
    op.add_column("users", sa.Column("role", user_role_enum, nullable=True))
    op.execute("UPDATE users SET role = (CASE WHEN is_superuser THEN 'SUPERUSER' ELSE 'USER' END) WHERE role IS NULL")
    op.alter_column("users", "role", nullable=False)


def downgrade() -> None:
    op.drop_column("users", "role")
    op.drop_index("ix_recipe_reports_status", table_name="recipe_reports")
    op.drop_index("ix_recipe_reports_reporter_user_id", table_name="recipe_reports")
    op.drop_index("ix_recipe_reports_recipe_id", table_name="recipe_reports")
    op.drop_index(op.f("ix_recipe_reports_id"), table_name="recipe_reports")
    op.drop_index("ix_recipe_reports_created_at", table_name="recipe_reports")
    op.drop_table("recipe_reports")
