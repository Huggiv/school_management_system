from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.models.base import Base
from app.models.enums import UserRole
from app.models.user import User
from app.security.auth import decode_token, hash_password
from app.services.auth_service import AuthService


def _session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    return SessionLocal()


def test_authenticate_and_issue_login_tokens() -> None:
    with _session() as db:
        user = User(
            first_name="Admin",
            last_name="User",
            email="admin@test.local",
            password=hash_password("Password123"),
            role=UserRole.ADMINISTRATOR,
            phone=None,
            profile_image=None,
        )
        db.add(user)
        db.commit()

        authed = AuthService.authenticate_user(db, "admin@test.local", "Password123")
        issued = AuthService.issue_login_tokens(authed)

        assert issued["token_type"] == "bearer"
        assert isinstance(issued["access_token"], str)
        assert isinstance(issued["refresh_token"], str)


def test_issue_and_use_password_reset_token() -> None:
    with _session() as db:
        user = User(
            first_name="Teacher",
            last_name="One",
            email="teacher@test.local",
            password=hash_password("OldPassword123"),
            role=UserRole.TEACHER,
            phone=None,
            profile_image=None,
        )
        db.add(user)
        db.commit()

        reset_token = AuthService.issue_password_reset_token(db, "teacher@test.local")
        assert reset_token is not None
        payload = decode_token(reset_token, expected_token_type="reset")
        assert payload.sub == "teacher@test.local"

        AuthService.reset_password(db, token=reset_token, new_password="NewPassword123")
        updated = AuthService.authenticate_user(db, "teacher@test.local", "NewPassword123")
        assert updated.email == "teacher@test.local"


def test_signup_guest_creates_guest_role_user() -> None:
    with _session() as db:
        user = AuthService.signup_guest(
            db,
            first_name="Guest",
            last_name="User",
            email="guest@test.local",
            password="Password123",
            phone=None,
        )

        assert user.email == "guest@test.local"
        assert user.role == UserRole.GUEST

        authed = AuthService.authenticate_user(db, "guest@test.local", "Password123")
        assert authed.id == user.id
