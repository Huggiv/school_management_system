from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.crud_factory import model_to_dict
from app.db.session import get_db_session
from app.models.enums import UserRole
from app.models.student_parent import StudentParent
from app.security.permissions import require_roles


router = APIRouter(prefix="/student-parents")


@router.get("/student/{student_id}")
def list_student_parents(
    student_id: int,
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.PARENT)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    items = db.execute(select(StudentParent).where(StudentParent.student_id == student_id)).scalars().all()
    return {"items": [model_to_dict(item) for item in items], "total": len(items)}


@router.post("/link", status_code=status.HTTP_201_CREATED)
def link_student_parent(
    payload: dict[str, Any] = Body(...),
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    try:
        student_id = int(payload.get("student_id"))
        parent_id = int(payload.get("parent_id"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="student_id and parent_id must be valid integers",
        )

    relationship_type = payload.get("relationship_type")
    raw_is_primary = payload.get("is_primary", False)
    if isinstance(raw_is_primary, str):
        normalized = raw_is_primary.strip().lower()
        if normalized in {"true", "1", "yes", "y"}:
            is_primary = True
        elif normalized in {"false", "0", "no", "n", ""}:
            is_primary = False
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="is_primary must be a boolean value")
    else:
        is_primary = bool(raw_is_primary)

    existing = db.execute(
        select(StudentParent).where(StudentParent.student_id == student_id, StudentParent.parent_id == parent_id)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Student-parent link already exists")

    if is_primary:
        links = db.execute(select(StudentParent).where(StudentParent.student_id == student_id)).scalars().all()
        for link in links:
            link.is_primary = False
            db.add(link)

    item = StudentParent(
        student_id=student_id,
        parent_id=parent_id,
        relationship_type=str(relationship_type) if relationship_type else None,
        is_primary=is_primary,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return model_to_dict(item)


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def unlink_student_parent(
    link_id: int,
    _: Any = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> None:
    item = db.get(StudentParent, link_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student-parent link not found")
    db.delete(item)
    db.commit()
