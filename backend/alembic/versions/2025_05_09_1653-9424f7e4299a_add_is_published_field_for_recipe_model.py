"""Add is_published field for recipe model

Revision ID: 9424f7e4299a
Revises: 7ac05de64f68
Create Date: 2025-05-09 16:53:31.158832

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9424f7e4299a"
down_revision: str | None = "7ac05de64f68"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("recipes", sa.Column("is_published", sa.Boolean(), nullable=False))


def downgrade() -> None:
    op.drop_column("recipes", "is_published")
