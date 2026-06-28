from app.models.announcement import Announcement
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=Announcement,
        search_fields=("title", "content"),
        sort_fields=("id", "published_at", "title"),
    )
)
