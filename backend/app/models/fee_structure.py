from sqlalchemy import Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class FeeStructure(TimestampMixin, Base):
    __tablename__ = "fee_structures"
    __table_args__ = (
        UniqueConstraint("class_name", "academic_year", name="uq_fee_structures_class_year"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    class_name: Mapped[str] = mapped_column(String(50), nullable=False)
    academic_year: Mapped[int] = mapped_column(Integer, nullable=False)
    amount_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    due_schedule_json: Mapped[str | None] = mapped_column(String(2000), nullable=True)
