from app.models.admission import Admission
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=Admission,
        search_fields=("application_number", "student_name", "status"),
        sort_fields=("id", "application_number", "status"),
    )
)
