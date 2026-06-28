"""Add fee fields to admissions.

Revision ID: 20260629_0005
Revises: 20260628_0004
Create Date: 2026-06-29 01:05:00
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260629_0005"
down_revision: Union[str, None] = "20260628_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "admissions",
        sa.Column("fee_total", sa.Float(), nullable=False, server_default=sa.text("0")),
    )
    op.add_column(
        "admissions",
        sa.Column("fee_paid", sa.Float(), nullable=False, server_default=sa.text("0")),
    )
    op.add_column(
        "admissions",
        sa.Column("fee_pending", sa.Float(), nullable=False, server_default=sa.text("0")),
    )


def downgrade() -> None:
    op.drop_column("admissions", "fee_pending")
    op.drop_column("admissions", "fee_paid")
    op.drop_column("admissions", "fee_total")
