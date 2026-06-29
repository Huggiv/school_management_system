from app.repositories.exam_results_repository import repository
from app.services.crud_service import CRUDService


service = CRUDService(repository)
