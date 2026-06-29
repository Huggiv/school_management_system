from sqlalchemy import ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class StudentFeeLedger(TimestampMixin, Base):
    __tablename__ = "student_fee_ledgers"
    __table_args__ = (
        UniqueConstraint("student_id", "fee_structure_id", name="uq_student_fee_ledgers_student_structure"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    fee_structure_id: Mapped[int] = mapped_column(ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    pending_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
