from app.models.teacher import Teacher
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=Teacher,
        search_fields=("employee_id", "department", "qualification"),
        sort_fields=("id", "employee_id", "department"),
    )
)
