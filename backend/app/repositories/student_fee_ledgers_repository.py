from app.models.student_fee_ledger import StudentFeeLedger
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=StudentFeeLedger,
        search_fields=("status",),
        sort_fields=("id", "student_id", "pending_amount", "status", "created_at"),
    )
)
