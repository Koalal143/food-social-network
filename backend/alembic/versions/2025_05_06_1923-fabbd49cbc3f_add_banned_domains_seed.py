"""add banned domains seed

Revision ID: fabbd49cbc3f
Revises: 30c9f797f0f3
Create Date: 2025-05-06 19:23:40.709488

"""

import datetime as dt
from collections.abc import Sequence
from pathlib import Path

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "fabbd49cbc3f"
down_revision: str | None = "30c9f797f0f3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    conn = op.get_bind()
    seed_path = Path(__file__).parent.parent / "seed_data" / "disposable_emails_blocklist.txt"
    current_datetime = dt.datetime.now(tz=dt.UTC)
    with Path.open(seed_path, "r", encoding="utf-8") as f:
        domains = f.read().splitlines()
    values = [{"domain": domain, "created_at": current_datetime} for domain in domains]
    if values:
        conn.execute(sa.text("INSERT INTO banned_emails (domain, created_at) VALUES (:domain, :created_at)"), values)


def downgrade() -> None:
    conn = op.get_bind()

    seed_path = Path(__file__).parent.parent / "seed_data" / "disposable_emails_blocklist.txt"
    with Path.open(seed_path) as f:
        domains = f.read().splitlines()

    if domains:
        conn.execute(
            sa.text("""
            DELETE FROM banned_emails WHERE updated_at IS NULL AND domain = ANY(:domains)
        """),
            {"domains": domains},
        )
