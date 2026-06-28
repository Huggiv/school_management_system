from __future__ import annotations

from datetime import date
from typing import Any

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.orm import Session

from app.api.crud_factory import build_crud_router, model_to_dict
from app.db.session import get_db_session
from app.models.enums import UserRole
from app.security.permissions import require_roles
from app.services.admissions_service import service


crud_router = build_crud_router(
    prefix="",
    service=service,
    read_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL),
    write_roles=(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL),
)

router = APIRouter(prefix="/admissions")


@router.get("/management")
def list_admissions_management(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    status: str | None = Query(default="all"),
    class_name: str | None = Query(default="all"),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    data = service.list_management(
        db,
        page=page,
        size=size,
        search=search,
        status_filter=status,
        class_name=class_name,
        from_date=from_date,
        to_date=to_date,
    )
    return {
        "items": [model_to_dict(item) for item in data["items"]],
        "page": data["page"],
        "size": data["size"],
        "total": data["total"],
    }


@router.patch("/bulk-status")
def bulk_update_status(
    payload: dict[str, Any] = Body(...),
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    ids = [int(item_id) for item_id in payload.get("ids", [])]
    target_status = str(payload.get("status", ""))
    actor = str(payload.get("actor", "system"))
    reason = str(payload.get("reason", ""))
    updated_count = service.bulk_update_status(db, ids, target_status, actor=actor, reason=reason)
    return {"updated": updated_count}


@router.patch("/assign-reviewer")
def assign_reviewer(
    payload: dict[str, Any] = Body(...),
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    ids = [int(item_id) for item_id in payload.get("ids", [])]
    reviewer_name = str(payload.get("reviewer_name", ""))
    updated_count = service.assign_reviewer(db, ids, reviewer_name)
    return {"updated": updated_count}


@router.get("/{item_id}/notes")
def get_admission_notes(
    item_id: int,
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    return {"items": service.get_notes(db, item_id)}


@router.post("/{item_id}/notes")
def add_admission_note(
    item_id: int,
    payload: dict[str, Any] = Body(...),
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    note = str(payload.get("note", ""))
    author = str(payload.get("author", "system"))
    notes = service.add_note(db, item_id=item_id, note=note, author=author)
    return {"items": notes}


@router.patch("/{item_id}/transition")
def transition_admission_status(
    item_id: int,
    payload: dict[str, Any] = Body(...),
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    target_status = str(payload.get("status", ""))
    actor = str(payload.get("actor", "system"))
    reason = str(payload.get("reason", ""))
    item = service.transition_status(db, item_id=item_id, target_status=target_status, actor=actor, reason=reason)
    return model_to_dict(item)


@router.get("/{item_id}/decision-log")
def get_admission_decision_log(
    item_id: int,
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    return {"items": service.get_decision_log(db, item_id)}


router.include_router(crud_router)
