"""Add author to recipe

Revision ID: aed69e6c0698
Revises: d7a8f17a111e
Create Date: 2025-05-08 14:39:43.404413

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "aed69e6c0698"
down_revision: str | None = "d7a8f17a111e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("banned_emails_domain_key", "banned_emails", type_="unique")
    op.create_unique_constraint(op.f("uq_banned_emails_domain"), "banned_emails", ["domain"])
    op.add_column("recipes", sa.Column("author_id", sa.Integer(), nullable=False))
    op.create_foreign_key(
        op.f("fk_recipes_author_id_users"), "recipes", "users", ["author_id"], ["id"], ondelete="SET NULL"
    )
    op.drop_constraint("user_profiles_user_id_key", "user_profiles", type_="unique")
    op.create_unique_constraint(op.f("uq_user_profiles_user_id"), "user_profiles", ["user_id"])


def downgrade() -> None:
    op.drop_constraint(op.f("uq_user_profiles_user_id"), "user_profiles", type_="unique")
    op.create_unique_constraint("user_profiles_user_id_key", "user_profiles", ["user_id"])
    op.drop_constraint(op.f("fk_recipes_author_id_users"), "recipes", type_="foreignkey")
    op.drop_column("recipes", "author_id")
    op.drop_constraint(op.f("uq_banned_emails_domain"), "banned_emails", type_="unique")
    op.create_unique_constraint("banned_emails_domain_key", "banned_emails", ["domain"])
