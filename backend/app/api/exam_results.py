from app.api.crud_factory import build_crud_router
from app.models.enums import UserRole
from app.services.exam_results_service import service


router = build_crud_router(
    prefix="exam-results",
    service=service,
    read_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER),
)
