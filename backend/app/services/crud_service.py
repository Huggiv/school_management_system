from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session


class CRUDService:
    def __init__(self, repository: Any) -> None:
        self.repository = repository

    def list(
        self,
        db: Session,
        page: int,
        size: int,
        sort: str | None,
        search: str | None,
    ) -> dict[str, Any]:
        return self.repository.list(db, page=page, size=size, sort=sort, search=search)

    def get(self, db: Session, item_id: int) -> Any:
        return self.repository.get(db, item_id)

    def create(self, db: Session, payload: dict[str, Any]) -> Any:
        return self.repository.create(db, payload)

    def update(self, db: Session, item_id: int, payload: dict[str, Any]) -> Any:
        return self.repository.update(db, item_id, payload)

    def delete(self, db: Session, item_id: int) -> None:
        self.repository.delete(db, item_id)
