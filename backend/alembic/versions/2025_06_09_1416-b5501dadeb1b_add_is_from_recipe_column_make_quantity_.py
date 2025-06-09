"""Add is_from_recipe column; make quantity field nullable in shopping list item model

Revision ID: b5501dadeb1b
Revises: f31e2dc4442e
Create Date: 2025-06-09 14:16:02.446484

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b5501dadeb1b"
down_revision: str | None = "f31e2dc4442e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("shopping_list_items", sa.Column("is_from_recipe", sa.Boolean(), nullable=False))
    op.alter_column("shopping_list_items", "quantity", existing_type=sa.VARCHAR(), nullable=True)


def downgrade() -> None:
    op.alter_column("shopping_list_items", "quantity", existing_type=sa.VARCHAR(), nullable=False)
    op.drop_column("shopping_list_items", "is_from_recipe")
