from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Depends, Query, status
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.models.enums import UserRole
from app.security.permissions import require_roles


def model_to_dict(model_obj: Any) -> dict[str, Any]:
    mapper = inspect(model_obj).mapper
    return {column.key: getattr(model_obj, column.key) for column in mapper.column_attrs}


def build_crud_router(
    prefix: str,
    service: Any,
    read_roles: tuple[UserRole, ...],
    write_roles: tuple[UserRole, ...],
) -> APIRouter:
    router_prefix = f"/{prefix}" if prefix else ""
    router = APIRouter(prefix=router_prefix)

    @router.get("/")
    def list_items(
        page: int = Query(default=1, ge=1),
        size: int = Query(default=20, ge=1, le=100),
        sort: str | None = Query(default=None),
        search: str | None = Query(default=None),
        _: Any = Depends(require_roles(*read_roles)),
        db: Session = Depends(get_db_session),
    ) -> dict[str, Any]:
        data = service.list(db, page=page, size=size, sort=sort, search=search)
        return {
            "items": [model_to_dict(item) for item in data["items"]],
            "page": data["page"],
            "size": data["size"],
            "total": data["total"],
        }

    @router.get("/{item_id}")
    def get_item(
        item_id: int,
        _: Any = Depends(require_roles(*read_roles)),
        db: Session = Depends(get_db_session),
    ) -> dict[str, Any]:
        item = service.get(db, item_id)
        return model_to_dict(item)

    @router.post("/", status_code=status.HTTP_201_CREATED)
    def create_item(
        payload: dict[str, Any] = Body(...),
        _: Any = Depends(require_roles(*write_roles)),
        db: Session = Depends(get_db_session),
    ) -> dict[str, Any]:
        item = service.create(db, payload)
        return model_to_dict(item)

    @router.put("/{item_id}")
    def update_item(
        item_id: int,
        payload: dict[str, Any] = Body(...),
        _: Any = Depends(require_roles(*write_roles)),
        db: Session = Depends(get_db_session),
    ) -> dict[str, Any]:
        item = service.update(db, item_id, payload)
        return model_to_dict(item)

    @router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_item(
        item_id: int,
        _: Any = Depends(require_roles(*write_roles)),
        db: Session = Depends(get_db_session),
    ) -> None:
        service.delete(db, item_id)

    return router
