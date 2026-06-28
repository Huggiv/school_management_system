from app.api.crud_factory import build_crud_router
from app.models.enums import UserRole
from app.services.events_service import service


router = build_crud_router(
    prefix="events",
    service=service,
    read_roles=(
        UserRole.ADMINISTRATOR,
        UserRole.PRINCIPAL,
        UserRole.TEACHER,
        UserRole.STUDENT,
        UserRole.PARENT,
        UserRole.GUEST,
    ),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL),
)
