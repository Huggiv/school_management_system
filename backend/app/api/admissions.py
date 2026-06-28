from app.api.crud_factory import build_crud_router
from app.models.enums import UserRole
from app.services.admissions_service import service


router = build_crud_router(
    prefix="admissions",
    service=service,
    read_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL),
)
