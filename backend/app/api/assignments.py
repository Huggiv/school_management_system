from app.api.crud_factory import build_crud_router
from app.models.enums import UserRole
from app.services.assignments_service import service


router = build_crud_router(
    prefix="assignments",
    service=service,
    read_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER),
)
