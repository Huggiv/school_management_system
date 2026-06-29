from app.models.exam_subject import ExamSubject
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=ExamSubject,
        search_fields=("class_name",),
        sort_fields=("id", "exam_session_id", "subject_id", "exam_date", "created_at"),
    )
)
