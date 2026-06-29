from app.api.crud_factory import build_crud_router
from app.models.enums import UserRole
from app.services.subjects_service import service


router = build_crud_router(
    prefix="subjects",
    service=service,
    read_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL),
)
