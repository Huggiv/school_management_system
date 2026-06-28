from app.models.enums import UserRole
from app.models.user import User
from app.security.auth import hash_password


def test_login_and_refresh_flow(client, db_session) -> None:
    user = User(
        first_name="Integration",
        last_name="Admin",
        email="integration-admin@test.local",
        password=hash_password("Password123"),
        role=UserRole.ADMINISTRATOR,
        phone=None,
        profile_image=None,
    )
    db_session.add(user)
    db_session.commit()

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "integration-admin@test.local", "password": "Password123"},
    )
    assert login_resp.status_code == 200
    login_body = login_resp.json()
    assert login_body["tokens"]["access_token"]
    assert login_body["tokens"]["refresh_token"]

    refresh_resp = client.post(
        "/api/v1/auth/refresh-token",
        json={"refresh_token": login_body["tokens"]["refresh_token"]},
    )
    assert refresh_resp.status_code == 200


def test_health_and_ready_endpoints(client) -> None:
    health = client.get("/health")
    ready = client.get("/ready")
    assert health.status_code == 200
    assert ready.status_code == 200
