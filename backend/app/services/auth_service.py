from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.enums import UserRole
from app.models.user import User
from app.security.auth import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
)


settings = get_settings()


class AuthService:
    @staticmethod
    def signup_guest(
        db: Session,
        *,
        first_name: str,
        last_name: str,
        email: str,
        password: str,
        phone: str | None,
    ) -> User:
        existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered",
            )

        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=hash_password(password),
            role=UserRole.GUEST,
            phone=phone,
            profile_image=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if user is None or not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        return user

    @staticmethod
    def issue_login_tokens(user: User) -> dict[str, str | int]:
        role_value = user.role.value if hasattr(user.role, "value") else str(user.role)
        access_token = create_access_token(subject=user.email, role=role_value)
        refresh_token = create_refresh_token(subject=user.email, role=role_value)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.jwt_access_token_expire_minutes * 60,
        }

    @staticmethod
    def refresh_access_token(refresh_token: str) -> dict[str, str | int]:
        payload = decode_token(refresh_token, expected_token_type="refresh")
        access_token = create_access_token(subject=payload.sub, role=payload.role)
        new_refresh_token = create_refresh_token(subject=payload.sub, role=payload.role)
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.jwt_access_token_expire_minutes * 60,
        }

    @staticmethod
    def issue_password_reset_token(db: Session, email: str) -> str | None:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if user is None:
            return None
        return create_reset_token(subject=user.email)

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> None:
        payload = decode_token(token, expected_token_type="reset")
        user = db.execute(select(User).where(User.email == payload.sub)).scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user.password = hash_password(new_password)
        db.add(user)
        db.commit()
