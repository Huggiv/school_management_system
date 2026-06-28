from sqlalchemy import String, Text
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin
from app.models.enums import AdmissionStatus


class Admission(TimestampMixin, Base):
    __tablename__ = "admissions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    application_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(150), nullable=False)
    class_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
    reviewer_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    notes_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    decision_log_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    status: Mapped[AdmissionStatus] = mapped_column(
        SqlEnum(
            AdmissionStatus,
            name="admission_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=AdmissionStatus.PENDING,
    )
