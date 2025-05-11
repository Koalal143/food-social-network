"""Fix foreign keys in recipe related models

Revision ID: aff6db829eda
Revises: 7943d3260ca2
Create Date: 2025-05-09 06:22:22.817408

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "aff6db829eda"
down_revision: str | None = "7943d3260ca2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("fk_recipe_ingredients_recipe_id_users", "recipe_ingredients", type_="foreignkey")
    op.create_foreign_key(
        op.f("fk_recipe_ingredients_recipe_id_recipes"),
        "recipe_ingredients",
        "recipes",
        ["recipe_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.drop_constraint("fk_recipe_instructions_recipe_id_users", "recipe_instructions", type_="foreignkey")
    op.create_foreign_key(
        op.f("fk_recipe_instructions_recipe_id_recipes"),
        "recipe_instructions",
        "recipes",
        ["recipe_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(op.f("fk_recipe_instructions_recipe_id_recipes"), "recipe_instructions", type_="foreignkey")
    op.create_foreign_key(
        "fk_recipe_instructions_recipe_id_users",
        "recipe_instructions",
        "users",
        ["recipe_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.drop_constraint(op.f("fk_recipe_ingredients_recipe_id_recipes"), "recipe_ingredients", type_="foreignkey")
    op.create_foreign_key(
        "fk_recipe_ingredients_recipe_id_users",
        "recipe_ingredients",
        "users",
        ["recipe_id"],
        ["id"],
        ondelete="CASCADE",
    )
