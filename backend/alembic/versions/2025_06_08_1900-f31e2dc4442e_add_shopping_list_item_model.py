"""Add shopping list item model

Revision ID: f31e2dc4442e
Revises: bc7ff9bc457b
Create Date: 2025-06-08 19:00:44.835271

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f31e2dc4442e"
down_revision: str | None = "bc7ff9bc457b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "shopping_list_items",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("quantity", sa.String(), nullable=False),
        sa.Column("recipe_id", sa.Integer(), nullable=True),
        sa.Column("recipe_ingredient_id", sa.Integer(), nullable=True),
        sa.Column("is_purchased", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["recipe_id"], ["recipes.id"], name=op.f("fk_shopping_list_items_recipe_id_recipes"), ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["recipe_ingredient_id"],
            ["recipe_ingredients.id"],
            name=op.f("fk_shopping_list_items_recipe_ingredient_id_recipe_ingredients"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_shopping_list_items_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_shopping_list_items")),
    )
    op.create_index(op.f("ix_shopping_list_items_id"), "shopping_list_items", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_shopping_list_items_id"), table_name="shopping_list_items")
    op.drop_table("shopping_list_items")
