from app.api.crud_factory import build_crud_router
from app.models.enums import UserRole
from app.services.student_fee_ledgers_service import service


router = build_crud_router(
    prefix="student-fee-ledgers",
    service=service,
    read_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.PARENT),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL),
)
