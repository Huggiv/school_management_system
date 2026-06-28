from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Gallery(TimestampMixin, Base):
    __tablename__ = "gallery"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    image: Mapped[str] = mapped_column(String(500), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
