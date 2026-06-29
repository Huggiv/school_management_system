from app.models.fee_payment import FeePayment
from app.repositories.base import CRUDRepository, RepositoryConfig


repository = CRUDRepository(
    RepositoryConfig(
        model=FeePayment,
        search_fields=("mode", "reference_no"),
        sort_fields=("id", "ledger_id", "paid_on", "amount", "created_at"),
    )
)
