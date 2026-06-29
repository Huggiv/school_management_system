from app.repositories.fee_payments_repository import repository
from app.services.crud_service import CRUDService


service = CRUDService(repository)
