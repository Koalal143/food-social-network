"""Add recipe dislike model

Revision ID: 3f8f017cbad1
Revises: 226961a428c4
Create Date: 2025-05-22 16:06:53.922105

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3f8f017cbad1"
down_revision: str | None = "226961a428c4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "disliked_recipes",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("recipe_id", sa.Integer(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["recipe_id"], ["recipes.id"], name=op.f("fk_disliked_recipes_recipe_id_recipes"), ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_disliked_recipes_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_disliked_recipes")),
    )
    op.create_index(op.f("ix_disliked_recipes_id"), "disliked_recipes", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_disliked_recipes_id"), table_name="disliked_recipes")
    op.drop_table("disliked_recipes")
