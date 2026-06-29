from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class FeePayment(TimestampMixin, Base):
    __tablename__ = "fee_payments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ledger_id: Mapped[int] = mapped_column(ForeignKey("student_fee_ledgers.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    paid_on: Mapped[Date] = mapped_column(Date, nullable=False)
    mode: Mapped[str] = mapped_column(String(30), nullable=False)
    reference_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    collected_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
