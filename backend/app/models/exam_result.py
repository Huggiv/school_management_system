from sqlalchemy import ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class ExamResult(TimestampMixin, Base):
    __tablename__ = "exam_results"
    __table_args__ = (
        UniqueConstraint("exam_subject_id", "student_id", name="uq_exam_results_subject_student"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    exam_subject_id: Mapped[int] = mapped_column(ForeignKey("exam_subjects.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    obtained_marks: Mapped[float] = mapped_column(Numeric(7, 2), nullable=False)
    grade_label: Mapped[str | None] = mapped_column(String(8), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    entered_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
