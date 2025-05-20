"""Add shopping list item model

Revision ID: ba0b5e6e62c3
Revises: 226961a428c4
Create Date: 2025-05-20 13:09:36.373663

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ba0b5e6e62c3"
down_revision: str | None = "226961a428c4"
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
