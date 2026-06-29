from app.api.crud_factory import build_crud_router
from app.models.enums import UserRole
from app.services.fee_payments_service import service


router = build_crud_router(
    prefix="fee-payments",
    service=service,
    read_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.PARENT),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL),
)
