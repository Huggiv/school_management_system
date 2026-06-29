from sqlalchemy import Date, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class ExamSubject(TimestampMixin, Base):
    __tablename__ = "exam_subjects"
    __table_args__ = (
        UniqueConstraint("exam_session_id", "subject_id", "class_name", name="uq_exam_subjects_session_subject_class"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    exam_session_id: Mapped[int] = mapped_column(ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False)
    class_name: Mapped[str] = mapped_column(String(50), nullable=False)
    max_marks: Mapped[float] = mapped_column(Numeric(7, 2), nullable=False)
    exam_date: Mapped[Date] = mapped_column(Date, nullable=False)
