"""Add admissions workflow statuses and decision audit log.

Revision ID: 20260628_0004
Revises: 20260628_0003
Create Date: 2026-06-28 23:58:00
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260628_0004"
down_revision: Union[str, None] = "20260628_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE admission_status ADD VALUE IF NOT EXISTS 'under_review'")
    op.execute("ALTER TYPE admission_status ADD VALUE IF NOT EXISTS 'waitlisted'")

    op.add_column(
        "admissions",
        sa.Column("decision_log_json", sa.Text(), nullable=False, server_default=sa.text("'[]'")),
    )


def downgrade() -> None:
    op.drop_column("admissions", "decision_log_json")
