"""add recipe related models

Revision ID: d7a8f17a111e
Revises: fabbd49cbc3f
Create Date: 2025-05-07 20:19:50.716642

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d7a8f17a111e"
down_revision: str | None = "fabbd49cbc3f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "recipe_ingredients",
        sa.Column("name", sa.String(length=135), nullable=False),
        sa.Column("quantity", sa.String(length=135), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recipe_ingredients_id"), "recipe_ingredients", ["id"], unique=False)
    op.create_table(
        "recipe_instructions",
        sa.Column("step_number", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=False),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recipe_instructions_id"), "recipe_instructions", ["id"], unique=False)
    op.create_table(
        "recipe_tags",
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recipe_tags_id"), "recipe_tags", ["id"], unique=False)
    op.create_table(
        "recipes",
        sa.Column("title", sa.String(length=135), nullable=False),
        sa.Column("short_description", sa.String(length=255), nullable=False),
        sa.Column("image_url", sa.String(length=255), nullable=False),
        sa.Column("difficulty", sa.Enum("EASY", "MEDIUM", "HARD", name="recipedifficultyenum"), nullable=False),
        sa.Column("cook_time_minutes", sa.Integer(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recipes_id"), "recipes", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_recipes_id"), table_name="recipes")
    op.drop_table("recipes")
    op.drop_index(op.f("ix_recipe_tags_id"), table_name="recipe_tags")
    op.drop_table("recipe_tags")
    op.drop_index(op.f("ix_recipe_instructions_id"), table_name="recipe_instructions")
    op.drop_table("recipe_instructions")
    op.drop_index(op.f("ix_recipe_ingredients_id"), table_name="recipe_ingredients")
    op.drop_table("recipe_ingredients")
