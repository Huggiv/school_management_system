from app.api.crud_factory import build_crud_router
from app.models.enums import UserRole
from app.services.grades_service import service


router = build_crud_router(
    prefix="grades",
    service=service,
    read_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER),
)
