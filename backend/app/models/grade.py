from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Grade(TimestampMixin, Base):
    __tablename__ = "grades"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    marks: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    grade: Mapped[str] = mapped_column(String(5), nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
