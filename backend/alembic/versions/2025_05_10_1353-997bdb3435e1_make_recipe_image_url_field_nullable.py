"""Make recipe image_url field nullable

Revision ID: 997bdb3435e1
Revises: 9424f7e4299a
Create Date: 2025-05-10 13:53:19.145199

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "997bdb3435e1"
down_revision: str | None = "9424f7e4299a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("recipes", "image_url", existing_type=sa.VARCHAR(length=255), nullable=True)


def downgrade() -> None:
    op.alter_column("recipes", "image_url", existing_type=sa.VARCHAR(length=255), nullable=False)
