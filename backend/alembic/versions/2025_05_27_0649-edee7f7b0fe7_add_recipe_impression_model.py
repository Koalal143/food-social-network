"""Add recipe impression model

Revision ID: edee7f7b0fe7
Revises: c9c646c16cb9
Create Date: 2025-05-27 06:49:39.512485

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "edee7f7b0fe7"
down_revision: str | None = "c9c646c16cb9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "recipe_impressions",
        sa.Column("anonymous_user_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("recipe_id", sa.Integer(), nullable=False),
        sa.Column(
            "source",
            sa.Enum(
                "SEARCH",
                "FEED",
                "RECOMMENDATIONS",
                "RECOMMENDATIONS_DETAIL",
                "FAVORITES",
                "AUTHOR_PAGE",
                "SHARED",
                name="recipegetsourceenum",
            ),
            nullable=True,
        ),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["anonymous_user_id"],
            ["anonymous_users.id"],
            name=op.f("fk_recipe_impressions_anonymous_user_id_anonymous_users"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["recipe_id"], ["recipes.id"], name=op.f("fk_recipe_impressions_recipe_id_recipes"), ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_recipe_impressions_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_recipe_impressions")),
    )
    op.create_index(op.f("ix_recipe_impressions_id"), "recipe_impressions", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_recipe_impressions_id"), table_name="recipe_impressions")
    op.drop_table("recipe_impressions")
