"""Add recipe model

Revision ID: 7053f8256f38
Revises: 4a5f192891de
Create Date: 2025-05-30 18:36:34.064158

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7053f8256f38"
down_revision: str | None = "4a5f192891de"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "recipes",
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_recipes")),
    )
    op.create_foreign_key(
        op.f("fk_user_feedback_recipe_id_recipes"),
        "user_feedback",
        "recipes",
        ["recipe_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        op.f("fk_user_impression_recipe_id_recipes"),
        "user_impression",
        "recipes",
        ["recipe_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(op.f("fk_user_impression_recipe_id_recipes"), "user_impression", type_="foreignkey")
    op.drop_constraint(op.f("fk_user_feedback_recipe_id_recipes"), "user_feedback", type_="foreignkey")
    op.drop_table("recipes")
