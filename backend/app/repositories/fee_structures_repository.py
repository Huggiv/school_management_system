from app.models.fee_structure import FeeStructure
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=FeeStructure,
        search_fields=("class_name",),
        sort_fields=("id", "class_name", "academic_year", "created_at"),
    )
)
