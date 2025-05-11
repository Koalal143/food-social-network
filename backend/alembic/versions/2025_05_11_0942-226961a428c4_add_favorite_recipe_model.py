"""Add favorite recipe model

Revision ID: 226961a428c4
Revises: 997bdb3435e1
Create Date: 2025-05-11 09:42:04.451305

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "226961a428c4"
down_revision: str | None = "997bdb3435e1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "favorite_recipes",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("recipe_id", sa.Integer(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["recipe_id"], ["recipes.id"], name=op.f("fk_favorite_recipes_recipe_id_recipes"), ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_favorite_recipes_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_favorite_recipes")),
    )
    op.create_index(op.f("ix_favorite_recipes_id"), "favorite_recipes", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_favorite_recipes_id"), table_name="favorite_recipes")
    op.drop_table("favorite_recipes")
