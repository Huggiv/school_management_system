from sqlalchemy import String
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin
from app.models.enums import AdmissionStatus


class Admission(TimestampMixin, Base):
    __tablename__ = "admissions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    application_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(150), nullable=False)
    status: Mapped[AdmissionStatus] = mapped_column(
        SqlEnum(AdmissionStatus, name="admission_status"), nullable=False, default=AdmissionStatus.PENDING
    )
