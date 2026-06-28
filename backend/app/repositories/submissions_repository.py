from app.models.submission import Submission
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=Submission,
        search_fields=("uploaded_file",),
        sort_fields=("id", "assignment_id", "student_id", "submitted_at"),
    )
)
