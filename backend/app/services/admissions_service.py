from __future__ import annotations

import json
from datetime import date, datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.models.admission import Admission
from app.models.enums import AdmissionStatus
from app.repositories.admissions_repository import repository
from app.services.crud_service import CRUDService

ALLOWED_STATUS_TRANSITIONS: dict[AdmissionStatus, set[AdmissionStatus]] = {
    AdmissionStatus.PENDING: {AdmissionStatus.UNDER_REVIEW},
    AdmissionStatus.UNDER_REVIEW: {
        AdmissionStatus.ACCEPTED,
        AdmissionStatus.REJECTED,
        AdmissionStatus.WAITLISTED,
    },
    AdmissionStatus.WAITLISTED: {
        AdmissionStatus.UNDER_REVIEW,
        AdmissionStatus.ACCEPTED,
        AdmissionStatus.REJECTED,
    },
    AdmissionStatus.ACCEPTED: set(),
    AdmissionStatus.REJECTED: set(),
}


class AdmissionsService(CRUDService):
    def _parse_json_list(self, raw_value: str | None) -> list[dict[str, Any]]:
        try:
            parsed = json.loads(raw_value or "[]")
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []

    def _append_decision_log(
        self,
        admission: Admission,
        from_status: AdmissionStatus,
        to_status: AdmissionStatus,
        actor: str,
        reason: str,
        source: str,
    ) -> None:
        decision_log = self._parse_json_list(admission.decision_log_json)
        decision_log.append(
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actor": actor.strip() or "system",
                "reason": reason.strip(),
                "source": source,
                "from_status": from_status.value,
                "to_status": to_status.value,
            }
        )
        admission.decision_log_json = json.dumps(decision_log)

    def _enforce_transition(
        self,
        current_status: AdmissionStatus,
        target_status: AdmissionStatus,
    ) -> None:
        if current_status == target_status:
            return

        allowed_targets = ALLOWED_STATUS_TRANSITIONS.get(current_status, set())
        if target_status not in allowed_targets:
            allowed = sorted(item.value for item in allowed_targets)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Invalid admission status transition",
                    "from": current_status.value,
                    "to": target_status.value,
                    "allowed": allowed,
                },
            )

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

    def report_metrics(self, db: Session, academic_year: int | None = None) -> dict[str, Any]:
        base_query = select(Admission)
        if academic_year:
            base_query = base_query.where(func.extract("year", Admission.created_at) == academic_year)

        scoped_subquery = base_query.subquery()

        total_applications = db.scalar(select(func.count()).select_from(scoped_subquery)) or 0
        accepted_count = db.scalar(
            select(func.count())
            .select_from(scoped_subquery)
            .where(scoped_subquery.c.status == AdmissionStatus.ACCEPTED.value)
        ) or 0
        pending_count = db.scalar(
            select(func.count())
            .select_from(scoped_subquery)
            .where(scoped_subquery.c.status.in_([AdmissionStatus.PENDING.value, AdmissionStatus.UNDER_REVIEW.value]))
        ) or 0

        grade_rows = (
            db.execute(
                select(scoped_subquery.c.class_name, func.count(scoped_subquery.c.id).label("count"))
                .where(scoped_subquery.c.class_name.is_not(None))
                .group_by(scoped_subquery.c.class_name)
                .order_by(func.count(scoped_subquery.c.id).desc())
            )
            .all()
        )

        gender_rows = (
            db.execute(
                select(scoped_subquery.c.gender, func.count(scoped_subquery.c.id).label("count"))
                .where(scoped_subquery.c.gender.is_not(None))
                .group_by(scoped_subquery.c.gender)
                .order_by(func.count(scoped_subquery.c.id).desc())
            )
            .all()
        )

        return {
            "academic_year": academic_year,
            "kpis": {
                "applications": int(total_applications),
                "accepted": int(accepted_count),
                "pending": int(pending_count),
            },
            "by_grade": [
                {"grade": str(row.class_name), "count": int(row.count)}
                for row in grade_rows
                if row.class_name
            ],
            "by_gender": [
                {"gender": str(row.gender), "count": int(row.count)}
                for row in gender_rows
                if row.gender
            ],
        }

    def update(self, db: Session, item_id: int, payload: dict[str, Any]) -> Any:
        admission = self.get(db, item_id)

        actor = str(payload.pop("decision_actor", "system"))
        reason = str(payload.pop("decision_reason", ""))

        if "status" in payload:
            try:
                target_status = AdmissionStatus(str(payload["status"]))
            except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid admission status") from exc

            self._enforce_transition(admission.status, target_status)
            if target_status != admission.status:
                if not reason.strip():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="decision_reason is required when changing admission status",
                    )
                self._append_decision_log(
                    admission,
                    from_status=admission.status,
                    to_status=target_status,
                    actor=actor,
                    reason=reason,
                    source="update",
                )
                admission.status = target_status

        for key, value in payload.items():
            if hasattr(admission, key):
                setattr(admission, key, value)

        db.add(admission)
        db.commit()
        db.refresh(admission)
        return admission

    def transition_status(
        self,
        db: Session,
        item_id: int,
        target_status: str,
        actor: str,
        reason: str,
    ) -> Admission:
        admission = self.get(db, item_id)
        try:
            next_status = AdmissionStatus(target_status)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid admission status") from exc

        self._enforce_transition(admission.status, next_status)
        if next_status != admission.status:
            if not reason.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="reason is required when changing admission status",
                )
            self._append_decision_log(
                admission,
                from_status=admission.status,
                to_status=next_status,
                actor=actor,
                reason=reason,
                source="transition",
            )
            admission.status = next_status
            db.add(admission)
            db.commit()
            db.refresh(admission)

        return admission

    def bulk_update_status(
        self,
        db: Session,
        admission_ids: list[int],
        status_value: str,
        actor: str,
        reason: str,
    ) -> int:
        if not admission_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No admission IDs provided")

        try:
            target_status = AdmissionStatus(status_value)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid admission status") from exc

        admissions = db.execute(select(Admission).where(Admission.id.in_(admission_ids))).scalars().all()
        if not admissions:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching admissions found")

        for item in admissions:
            self._enforce_transition(item.status, target_status)

        updated_count = 0
        for item in admissions:
            if item.status == target_status:
                continue
            if not reason.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="reason is required when changing admission status",
                )
            self._append_decision_log(
                item,
                from_status=item.status,
                to_status=target_status,
                actor=actor,
                reason=reason,
                source="bulk-status",
            )
            item.status = target_status
            db.add(item)
            updated_count += 1

        db.commit()
        return updated_count

    def assign_reviewer(self, db: Session, admission_ids: list[int], reviewer_name: str) -> int:
        if not admission_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No admission IDs provided")

        reviewer = reviewer_name.strip()
        if not reviewer:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reviewer name is required")

        admissions = db.execute(select(Admission).where(Admission.id.in_(admission_ids))).scalars().all()
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

        existing = self._parse_json_list(admission.notes_json)
        existing.append(
            {
                "author": author_value,
                "note": note_value,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )
        admission.notes_json = json.dumps(existing)
        db.add(admission)
        db.commit()
        db.refresh(admission)
        return existing

    def get_notes(self, db: Session, item_id: int) -> list[dict[str, str]]:
        admission = self.get(db, item_id)
        return self._parse_json_list(admission.notes_json)

    def get_decision_log(self, db: Session, item_id: int) -> list[dict[str, Any]]:
        admission = self.get(db, item_id)
        return self._parse_json_list(admission.decision_log_json)


service = AdmissionsService(repository)
