from app.models.parent import Parent
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(model=Parent, search_fields=("relation", "phone"), sort_fields=("id", "phone"))
)
