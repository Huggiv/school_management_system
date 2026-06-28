"""Add query-performance indexes for frequently filtered columns.

Revision ID: 20260628_0002
Revises: 20260628_0001
Create Date: 2026-06-28 22:10:00
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260628_0002"
down_revision: Union[str, None] = "20260628_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_users_email", "users", ["email"], unique=False)
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_index("ix_grades_student_id", "grades", ["student_id"], unique=False)
    op.create_index("ix_submissions_assignment_id", "submissions", ["assignment_id"], unique=False)
    op.create_index("ix_events_event_date", "events", ["event_date"], unique=False)
    op.create_index("ix_announcements_published_at", "announcements", ["published_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_announcements_published_at", table_name="announcements")
    op.drop_index("ix_events_event_date", table_name="events")
    op.drop_index("ix_submissions_assignment_id", table_name="submissions")
    op.drop_index("ix_grades_student_id", table_name="grades")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
