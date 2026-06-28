from __future__ import annotations

import json
from datetime import date
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.models.admission import Admission
from app.models.enums import AdmissionStatus
from app.repositories.admissions_repository import repository
from app.services.crud_service import CRUDService


class AdmissionsService(CRUDService):
	def list_management(
		self,
		db: Session,
		page: int,
		size: int,
		search: str | None,
		status_filter: str | None,
		class_name: str | None,
		from_date: date | None,
		to_date: date | None,
	) -> dict[str, Any]:
		query = select(Admission)
		filters: list[Any] = []

		if search:
			search_expr = f"%{search}%"
			filters.append(
				or_(
					Admission.application_number.ilike(search_expr),
					Admission.student_name.ilike(search_expr),
					Admission.class_name.ilike(search_expr),
					Admission.reviewer_name.ilike(search_expr),
					Admission.email.ilike(search_expr),
				)
			)

		if status_filter and status_filter != "all":
			try:
				filters.append(Admission.status == AdmissionStatus(status_filter))
			except ValueError as exc:
				raise HTTPException(
					status_code=status.HTTP_400_BAD_REQUEST,
					detail="Invalid admission status filter",
				) from exc

		if class_name and class_name != "all":
			filters.append(Admission.class_name == class_name)

		if from_date:
			filters.append(func.date(Admission.created_at) >= from_date)

		if to_date:
			filters.append(func.date(Admission.created_at) <= to_date)

		if filters:
			query = query.where(and_(*filters))

		total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
		items = (
			db.execute(query.order_by(Admission.created_at.desc()).offset((page - 1) * size).limit(size))
			.scalars()
			.all()
		)
		return {"items": items, "page": page, "size": size, "total": total}

	def bulk_update_status(self, db: Session, admission_ids: list[int], status_value: str) -> int:
		if not admission_ids:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No admission IDs provided")

		try:
			target_status = AdmissionStatus(status_value)
		except ValueError as exc:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid admission status") from exc

		admissions = (
			db.execute(select(Admission).where(Admission.id.in_(admission_ids))).scalars().all()
		)
		if not admissions:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching admissions found")

		for item in admissions:
			item.status = target_status
			db.add(item)

		db.commit()
		return len(admissions)

	def assign_reviewer(self, db: Session, admission_ids: list[int], reviewer_name: str) -> int:
		if not admission_ids:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No admission IDs provided")

		reviewer = reviewer_name.strip()
		if not reviewer:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reviewer name is required")

		admissions = (
			db.execute(select(Admission).where(Admission.id.in_(admission_ids))).scalars().all()
		)
		if not admissions:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching admissions found")

		for item in admissions:
			item.reviewer_name = reviewer
			db.add(item)

		db.commit()
		return len(admissions)

	def add_note(self, db: Session, item_id: int, note: str, author: str) -> list[dict[str, str]]:
		admission = self.get(db, item_id)
		note_value = note.strip()
		author_value = author.strip() or "system"
		if not note_value:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Note cannot be empty")

		try:
			existing = json.loads(admission.notes_json or "[]")
			if not isinstance(existing, list):
				existing = []
		except json.JSONDecodeError:
			existing = []

		existing.append({"author": author_value, "note": note_value, "timestamp": date.today().isoformat()})
		admission.notes_json = json.dumps(existing)
		db.add(admission)
		db.commit()
		db.refresh(admission)
		return existing

	def get_notes(self, db: Session, item_id: int) -> list[dict[str, str]]:
		admission = self.get(db, item_id)
		try:
			notes = json.loads(admission.notes_json or "[]")
			if isinstance(notes, list):
				return notes
			return []
		except json.JSONDecodeError:
			return []


service = AdmissionsService(repository)
