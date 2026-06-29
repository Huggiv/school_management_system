from app.repositories.student_fee_ledgers_repository import repository
from app.services.crud_service import CRUDService


service = CRUDService(repository)
