from app.models.user import User
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(model=User, search_fields=("email", "first_name", "last_name"), sort_fields=("id", "email", "role"))
)
