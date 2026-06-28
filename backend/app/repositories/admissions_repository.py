from app.models.admission import Admission
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=Admission,
        search_fields=("application_number", "student_name", "status", "class_name", "reviewer_name", "email"),
        sort_fields=("id", "application_number", "status", "class_name", "created_at", "reviewer_name"),
    )
)
