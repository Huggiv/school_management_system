from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session


@dataclass(slots=True)
class RepositoryConfig:
    model: Any
    search_fields: tuple[str, ...]
    sort_fields: tuple[str, ...]


class CRUDRepository:
    def __init__(self, config: RepositoryConfig) -> None:
        self.config = config

    def _resolve_sort_field(self, sort: str | None) -> Any:
        default_field = self.config.sort_fields[0]
        if not sort:
            return getattr(self.config.model, default_field).asc()

        descending = sort.startswith("-")
        sort_key = sort[1:] if descending else sort
        if sort_key not in self.config.sort_fields:
            sort_key = default_field

        column = getattr(self.config.model, sort_key)
        return column.desc() if descending else column.asc()

    def list(
        self,
        db: Session,
        page: int,
        size: int,
        sort: str | None,
        search: str | None,
    ) -> dict[str, Any]:
        query = select(self.config.model)
        if search and self.config.search_fields:
            search_conditions = [
                cast(getattr(self.config.model, field), String).ilike(f"%{search}%")
                for field in self.config.search_fields
            ]
            query = query.where(or_(*search_conditions))

        total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
        ordered_query = query.order_by(self._resolve_sort_field(sort))
        items = db.execute(ordered_query.offset((page - 1) * size).limit(size)).scalars().all()
        return {"items": items, "page": page, "size": size, "total": total}

    def get(self, db: Session, item_id: int) -> Any:
        item = db.get(self.config.model, item_id)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        return item

    def create(self, db: Session, payload: dict[str, Any]) -> Any:
        item = self.config.model(**payload)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update(self, db: Session, item_id: int, payload: dict[str, Any]) -> Any:
        item = self.get(db, item_id)
        for key, value in payload.items():
            if hasattr(item, key):
                setattr(item, key, value)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def delete(self, db: Session, item_id: int) -> None:
        item = self.get(db, item_id)
        db.delete(item)
        db.commit()
