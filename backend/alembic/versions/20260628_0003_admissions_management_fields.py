"""Add admissions management fields for filtering, reviewer assignment, and note history.

Revision ID: 20260628_0003
Revises: 20260628_0002
Create Date: 2026-06-28 23:40:00
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260628_0003"
down_revision: Union[str, None] = "20260628_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("admissions", sa.Column("class_name", sa.String(length=50), nullable=True))
    op.add_column("admissions", sa.Column("email", sa.String(length=255), nullable=True))
    op.add_column("admissions", sa.Column("contact_number", sa.String(length=32), nullable=True))
    op.add_column("admissions", sa.Column("reviewer_name", sa.String(length=150), nullable=True))
    op.add_column(
        "admissions",
        sa.Column("notes_json", sa.Text(), nullable=False, server_default=sa.text("'[]'")),
    )

    op.create_index("ix_admissions_class_name", "admissions", ["class_name"], unique=False)
    op.create_index("ix_admissions_reviewer_name", "admissions", ["reviewer_name"], unique=False)
    op.create_index("ix_admissions_created_at", "admissions", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_admissions_created_at", table_name="admissions")
    op.drop_index("ix_admissions_reviewer_name", table_name="admissions")
    op.drop_index("ix_admissions_class_name", table_name="admissions")

    op.drop_column("admissions", "notes_json")
    op.drop_column("admissions", "reviewer_name")
    op.drop_column("admissions", "contact_number")
    op.drop_column("admissions", "email")
    op.drop_column("admissions", "class_name")
