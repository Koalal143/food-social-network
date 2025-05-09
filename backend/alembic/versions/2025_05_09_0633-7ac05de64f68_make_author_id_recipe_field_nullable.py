"""Make author_id recipe field nullable

Revision ID: 7ac05de64f68
Revises: aff6db829eda
Create Date: 2025-05-09 06:33:59.869146

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7ac05de64f68"
down_revision: str | None = "aff6db829eda"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("recipes", "author_id", existing_type=sa.INTEGER(), nullable=True)


def downgrade() -> None:
    op.alter_column("recipes", "author_id", existing_type=sa.INTEGER(), nullable=False)
