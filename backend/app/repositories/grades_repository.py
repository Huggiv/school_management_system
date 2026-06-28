from app.models.grade import Grade
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=Grade,
        search_fields=("subject", "grade", "remarks"),
        sort_fields=("id", "student_id", "subject"),
    )
)
