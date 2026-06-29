from app.models.exam_result import ExamResult
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=ExamResult,
        search_fields=("grade_label", "remarks"),
        sort_fields=("id", "exam_subject_id", "student_id", "obtained_marks", "created_at"),
    )
)
