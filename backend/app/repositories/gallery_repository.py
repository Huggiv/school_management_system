from app.models.gallery import Gallery
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(model=Gallery, search_fields=("title", "category", "image"), sort_fields=("id", "category", "title"))
)
