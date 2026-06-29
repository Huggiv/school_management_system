"""Add gender field to admissions.

Revision ID: 20260629_0006
Revises: 20260629_0005
Create Date: 2026-06-29 01:25:00
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260629_0006"
down_revision: Union[str, None] = "20260629_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("admissions", sa.Column("gender", sa.String(length=32), nullable=True))


def downgrade() -> None:
    op.drop_column("admissions", "gender")
