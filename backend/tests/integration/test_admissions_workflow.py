from __future__ import annotations

from app.models.enums import AdmissionStatus, UserRole
from app.models.user import User
from app.security.auth import hash_password


def _admin_auth_headers(client, db_session) -> dict[str, str]:
    admin_email = "workflow-admin@test.local"
    user = db_session.query(User).filter(User.email == admin_email).one_or_none()
    if user is None:
        user = User(
            first_name="Workflow",
            last_name="Admin",
            email=admin_email,
            password=hash_password("Password123"),
            role=UserRole.ADMINISTRATOR,
            phone=None,
            profile_image=None,
        )
        db_session.add(user)
        db_session.commit()

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": admin_email, "password": "Password123"},
    )
    assert login_resp.status_code == 200
    access_token = login_resp.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


def _create_admission(client, headers: dict[str, str], application_number: str, student_name: str) -> dict:
    response = client.post(
        "/api/v1/admissions",
        headers=headers,
        json={
            "application_number": application_number,
            "student_name": student_name,
            "status": AdmissionStatus.PENDING.value,
            "class_name": "grade_7",
            "email": f"{application_number.lower()}@test.local",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_valid_transition_creates_decision_log(client, db_session) -> None:
    headers = _admin_auth_headers(client, db_session)
    created = _create_admission(client, headers, "APP-WF-001", "Learner One")

    transition = client.patch(
        f"/api/v1/admissions/{created['id']}/transition",
        headers=headers,
        json={
            "status": AdmissionStatus.UNDER_REVIEW.value,
            "actor": "principal.user",
            "reason": "Initial screening completed",
        },
    )
    assert transition.status_code == 200
    assert transition.json()["status"] == AdmissionStatus.UNDER_REVIEW.value

    decision_log_resp = client.get(f"/api/v1/admissions/{created['id']}/decision-log", headers=headers)
    assert decision_log_resp.status_code == 200
    log_items = decision_log_resp.json()["items"]
    assert len(log_items) == 1
    assert log_items[0]["from_status"] == AdmissionStatus.PENDING.value
    assert log_items[0]["to_status"] == AdmissionStatus.UNDER_REVIEW.value
    assert log_items[0]["actor"] == "principal.user"
    assert log_items[0]["reason"] == "Initial screening completed"


def test_invalid_transition_is_rejected(client, db_session) -> None:
    headers = _admin_auth_headers(client, db_session)
    created = _create_admission(client, headers, "APP-WF-002", "Learner Two")

    invalid_transition = client.patch(
        f"/api/v1/admissions/{created['id']}/transition",
        headers=headers,
        json={
            "status": AdmissionStatus.ACCEPTED.value,
            "actor": "principal.user",
            "reason": "Trying direct acceptance",
        },
    )
    assert invalid_transition.status_code == 400
    payload = invalid_transition.json()["detail"]
    assert payload["message"] == "Invalid admission status transition"
    assert payload["from"] == AdmissionStatus.PENDING.value
    assert payload["to"] == AdmissionStatus.ACCEPTED.value


def test_bulk_transition_requires_reason_and_logs_decisions(client, db_session) -> None:
    headers = _admin_auth_headers(client, db_session)
    first = _create_admission(client, headers, "APP-WF-003", "Learner Three")
    second = _create_admission(client, headers, "APP-WF-004", "Learner Four")

    missing_reason = client.patch(
        "/api/v1/admissions/bulk-status",
        headers=headers,
        json={
            "ids": [first["id"], second["id"]],
            "status": AdmissionStatus.UNDER_REVIEW.value,
            "actor": "admin.user",
            "reason": "",
        },
    )
    assert missing_reason.status_code == 400
    assert "reason is required" in missing_reason.json()["detail"]

    valid_bulk = client.patch(
        "/api/v1/admissions/bulk-status",
        headers=headers,
        json={
            "ids": [first["id"], second["id"]],
            "status": AdmissionStatus.UNDER_REVIEW.value,
            "actor": "admin.user",
            "reason": "Batch moved to review",
        },
    )
    assert valid_bulk.status_code == 200
    assert valid_bulk.json()["updated"] == 2

    first_log = client.get(f"/api/v1/admissions/{first['id']}/decision-log", headers=headers)
    assert first_log.status_code == 200
    assert first_log.json()["items"][0]["source"] == "bulk-status"
    assert first_log.json()["items"][0]["reason"] == "Batch moved to review"


def test_put_update_requires_decision_reason_when_status_changes(client, db_session) -> None:
    headers = _admin_auth_headers(client, db_session)
    created = _create_admission(client, headers, "APP-WF-005", "Learner Five")

    update_without_reason = client.put(
        f"/api/v1/admissions/{created['id']}",
        headers=headers,
        json={"status": AdmissionStatus.UNDER_REVIEW.value, "decision_actor": "admin.user"},
    )
    assert update_without_reason.status_code == 400
    assert "decision_reason is required" in update_without_reason.json()["detail"]
