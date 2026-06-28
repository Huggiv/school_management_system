from app.models.assignment import Assignment
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=Assignment,
        search_fields=("title", "description", "attachment"),
        sort_fields=("id", "teacher_id", "due_date"),
    )
)
