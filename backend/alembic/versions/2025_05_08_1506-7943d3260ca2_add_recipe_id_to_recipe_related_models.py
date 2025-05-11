"""Add recipe id to recipe related models

Revision ID: 7943d3260ca2
Revises: aed69e6c0698
Create Date: 2025-05-08 15:06:24.300262

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7943d3260ca2"
down_revision: str | None = "aed69e6c0698"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("recipe_ingredients", sa.Column("recipe_id", sa.Integer(), nullable=False))
    op.create_foreign_key(
        op.f("fk_recipe_ingredients_recipe_id_users"),
        "recipe_ingredients",
        "users",
        ["recipe_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.add_column("recipe_instructions", sa.Column("recipe_id", sa.Integer(), nullable=False))
    op.create_foreign_key(
        op.f("fk_recipe_instructions_recipe_id_users"),
        "recipe_instructions",
        "users",
        ["recipe_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.add_column("recipe_tags", sa.Column("recipe_id", sa.Integer(), nullable=False))
    op.create_foreign_key(
        op.f("fk_recipe_tags_recipe_id_recipes"), "recipe_tags", "recipes", ["recipe_id"], ["id"], ondelete="CASCADE"
    )


def downgrade() -> None:
    op.drop_constraint(op.f("fk_recipe_tags_recipe_id_recipes"), "recipe_tags", type_="foreignkey")
    op.drop_column("recipe_tags", "recipe_id")
    op.drop_constraint(op.f("fk_recipe_instructions_recipe_id_users"), "recipe_instructions", type_="foreignkey")
    op.drop_column("recipe_instructions", "recipe_id")
    op.drop_constraint(op.f("fk_recipe_ingredients_recipe_id_users"), "recipe_ingredients", type_="foreignkey")
    op.drop_column("recipe_ingredients", "recipe_id")
