"""Rename image url to image path

Revision ID: bc7ff9bc457b
Revises: cc1dd8e56ce8
Create Date: 2025-05-28 12:45:37.982529

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "bc7ff9bc457b"
down_revision: str | None = "cc1dd8e56ce8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("recipe_instructions", "image_url", new_column_name="image_path")
    op.alter_column("recipes", "image_url", new_column_name="image_path")


def downgrade() -> None:
    op.alter_column("recipe_instructions", "image_path", new_column_name="image_url")
    op.alter_column("recipes", "image_path", new_column_name="image_url")
