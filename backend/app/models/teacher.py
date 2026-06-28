from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Teacher(TimestampMixin, Base):
    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), unique=True)
    employee_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    qualification: Mapped[str | None] = mapped_column(String(150), nullable=True)
