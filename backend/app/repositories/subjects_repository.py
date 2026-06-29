from app.models.subject import Subject
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(model=Subject, search_fields=("code", "name"), sort_fields=("id", "code", "name", "created_at"))
)
