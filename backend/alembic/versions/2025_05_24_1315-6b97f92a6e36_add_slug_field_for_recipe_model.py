"""Add slug field for recipe model

Revision ID: 6b97f92a6e36
Revises: 3f8f017cbad1
Create Date: 2025-05-24 13:15:53.899072

"""

import uuid
from collections.abc import Sequence

import sqlalchemy as sa
from slugify import slugify
from sqlalchemy import update

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6b97f92a6e36"
down_revision: str | None = "3f8f017cbad1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def create_slug_for_migration(title: str) -> str:
    title_slug = slugify(title, max_length=60)
    return f"{title_slug}-{uuid.uuid4().hex[:8]}"


def upgrade() -> None:
    op.add_column("recipes", sa.Column("slug", sa.String(length=110), nullable=True, default=None))

    conn = op.get_bind()

    recipes_table = sa.table("recipes", sa.column("id"), sa.column("title"), sa.column("slug"))
    recipes = conn.execute(sa.select(recipes_table.c.id, recipes_table.c.title)).fetchall()

    update_data = []
    for recipe in recipes:
        slug = create_slug_for_migration(recipe.title)
        update_data.append({"recipe_id": recipe.id, "slug": slug})

    if update_data:
        conn.execute(
            update(recipes_table)
            .where(recipes_table.c.id == sa.bindparam("recipe_id"))
            .values(slug=sa.bindparam("slug")),
            update_data,
        )

    op.alter_column("recipes", "slug", nullable=False)
    op.create_index("ix_recipes_slug", "recipes", ["slug"], unique=False)
    op.create_unique_constraint(op.f("uq_recipes_slug"), "recipes", ["slug"])


def downgrade() -> None:
    op.drop_constraint(op.f("uq_recipes_slug"), "recipes", type_="unique")
    op.drop_index("ix_recipes_slug", table_name="recipes")
    op.drop_column("recipes", "slug")
