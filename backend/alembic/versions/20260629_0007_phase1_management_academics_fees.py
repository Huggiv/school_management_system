"""Phase 1 architecture tables for management, academics/exams, and fees.

Revision ID: 20260629_0007
Revises: 20260629_0006
Create Date: 2026-06-29 11:10:00
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260629_0007"
down_revision: Union[str, None] = "20260629_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "student_parents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=False),
        sa.Column("relationship_type", sa.String(length=50), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_id"], ["parents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", "parent_id", name="uq_student_parents_student_parent"),
    )

    op.create_table(
        "subjects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=30), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.String(length=300), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )

    op.create_table(
        "exam_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("academic_year", sa.Integer(), nullable=False),
        sa.Column("term", sa.String(length=30), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="draft"),
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "exam_subjects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("exam_session_id", sa.Integer(), nullable=False),
        sa.Column("subject_id", sa.Integer(), nullable=False),
        sa.Column("class_name", sa.String(length=50), nullable=False),
        sa.Column("max_marks", sa.Numeric(precision=7, scale=2), nullable=False),
        sa.Column("exam_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["exam_session_id"], ["exam_sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["subject_id"], ["subjects.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("exam_session_id", "subject_id", "class_name", name="uq_exam_subjects_session_subject_class"),
    )

    op.create_table(
        "exam_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("exam_subject_id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("obtained_marks", sa.Numeric(precision=7, scale=2), nullable=False),
        sa.Column("grade_label", sa.String(length=8), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("entered_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["exam_subject_id"], ["exam_subjects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["entered_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("exam_subject_id", "student_id", name="uq_exam_results_subject_student"),
    )

    op.create_table(
        "fee_structures",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("class_name", sa.String(length=50), nullable=False),
        sa.Column("academic_year", sa.Integer(), nullable=False),
        sa.Column("amount_total", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("due_schedule_json", sa.String(length=2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("class_name", "academic_year", name="uq_fee_structures_class_year"),
    )

    op.create_table(
        "student_fee_ledgers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("fee_structure_id", sa.Integer(), nullable=False),
        sa.Column("total_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("paid_amount", sa.Numeric(precision=12, scale=2), nullable=False, server_default=sa.text("0")),
        sa.Column("pending_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["fee_structure_id"], ["fee_structures.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", "fee_structure_id", name="uq_student_fee_ledgers_student_structure"),
    )

    op.create_table(
        "fee_payments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ledger_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("paid_on", sa.Date(), nullable=False),
        sa.Column("mode", sa.String(length=30), nullable=False),
        sa.Column("reference_no", sa.String(length=100), nullable=True),
        sa.Column("collected_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["ledger_id"], ["student_fee_ledgers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["collected_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("ix_exam_sessions_academic_year", "exam_sessions", ["academic_year"], unique=False)
    op.create_index("ix_exam_subjects_class_name", "exam_subjects", ["class_name"], unique=False)
    op.create_index("ix_exam_results_student_id", "exam_results", ["student_id"], unique=False)
    op.create_index("ix_fee_structures_class_name", "fee_structures", ["class_name"], unique=False)
    op.create_index("ix_student_fee_ledgers_status", "student_fee_ledgers", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_student_fee_ledgers_status", table_name="student_fee_ledgers")
    op.drop_index("ix_fee_structures_class_name", table_name="fee_structures")
    op.drop_index("ix_exam_results_student_id", table_name="exam_results")
    op.drop_index("ix_exam_subjects_class_name", table_name="exam_subjects")
    op.drop_index("ix_exam_sessions_academic_year", table_name="exam_sessions")

    op.drop_table("fee_payments")
    op.drop_table("student_fee_ledgers")
    op.drop_table("fee_structures")
    op.drop_table("exam_results")
    op.drop_table("exam_subjects")
    op.drop_table("exam_sessions")
    op.drop_table("subjects")
    op.drop_table("student_parents")
