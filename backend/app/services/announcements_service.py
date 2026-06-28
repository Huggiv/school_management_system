from app.repositories.announcements_repository import repository
from app.services.crud_service import CRUDService


service = CRUDService(repository)
