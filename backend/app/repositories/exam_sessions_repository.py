from app.models.exam_session import ExamSession
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=ExamSession,
        search_fields=("name", "term", "status"),
        sort_fields=("id", "academic_year", "start_date", "end_date", "created_at"),
    )
)
