from app.models.student import Student
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=Student,
        search_fields=("admission_number", "class_name", "section", "guardian"),
        sort_fields=("id", "admission_number", "class_name"),
    )
)
