from app.models.event import Event
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(model=Event, search_fields=("title", "description"), sort_fields=("id", "event_date", "title"))
)
