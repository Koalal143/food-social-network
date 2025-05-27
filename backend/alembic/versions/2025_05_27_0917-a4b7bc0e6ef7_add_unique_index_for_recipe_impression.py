"""Add unique index for recipe impression

Revision ID: a4b7bc0e6ef7
Revises: edee7f7b0fe7
Create Date: 2025-05-27 09:17:56.165169

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a4b7bc0e6ef7"
down_revision: str | None = "edee7f7b0fe7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_unique_constraint(
        op.f("uq_recipe_impressions_anonymous_user_id"), "recipe_impressions", ["anonymous_user_id", "recipe_id"]
    )
    op.create_unique_constraint(op.f("uq_recipe_impressions_user_id"), "recipe_impressions", ["user_id", "recipe_id"])


def downgrade() -> None:
    op.drop_constraint(op.f("uq_recipe_impressions_user_id"), "recipe_impressions", type_="unique")
    op.drop_constraint(op.f("uq_recipe_impressions_anonymous_user_id"), "recipe_impressions", type_="unique")
