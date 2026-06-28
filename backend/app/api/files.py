from pathlib import Path

from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import FileResponse

from app.models.enums import UserRole
from app.security.permissions import require_roles
from app.services.storage_service import storage_service


router = APIRouter(prefix="/files")


@router.post("/upload")
def upload_file(
    category: str = Query(default="general"),
    file: UploadFile = File(...),
    _: object = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT)),
) -> dict[str, str]:
    relative_path = storage_service.save_upload(file, category=category)
    return {"path": relative_path}


@router.get("/download/{relative_path:path}")
def download_file(
    relative_path: str,
    _: object = Depends(
        require_roles(
            UserRole.ADMINISTRATOR,
            UserRole.PRINCIPAL,
            UserRole.TEACHER,
            UserRole.STUDENT,
            UserRole.PARENT,
        )
    ),
) -> FileResponse:
    file_path = storage_service.resolve_download_path(relative_path)
    return FileResponse(path=file_path, filename=Path(file_path).name)
