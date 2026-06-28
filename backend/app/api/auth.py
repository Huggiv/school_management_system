from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db_session
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService


settings = get_settings()
router = APIRouter(prefix="/auth")


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db_session)) -> LoginResponse:
    user = AuthService.authenticate_user(db, payload.email, payload.password)
    tokens = TokenResponse(**AuthService.issue_login_tokens(user))
    role_value = user.role.value if hasattr(user.role, "value") else str(user.role)
    return LoginResponse(
        tokens=tokens,
        user={
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": role_value,
            "phone": user.phone,
            "profile_image": user.profile_image,
        },
    )


@router.post("/signup", response_model=LoginResponse, status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db_session)) -> LoginResponse:
    user = AuthService.signup_guest(
        db,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        password=payload.password,
        phone=payload.phone,
    )
    tokens = TokenResponse(**AuthService.issue_login_tokens(user))
    role_value = user.role.value if hasattr(user.role, "value") else str(user.role)
    return LoginResponse(
        tokens=tokens,
        user={
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": role_value,
            "phone": user.phone,
            "profile_image": user.profile_image,
        },
    )


@router.post("/refresh-token", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest) -> TokenResponse:
    token_data = AuthService.refresh_access_token(payload.refresh_token)
    return TokenResponse(**token_data)


@router.post("/logout", response_model=MessageResponse)
def logout() -> MessageResponse:
    return MessageResponse(message="Logout successful")


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db_session),
) -> ForgotPasswordResponse:
    reset_token = AuthService.issue_password_reset_token(db, payload.email)
    if settings.app_env == "development":
        return ForgotPasswordResponse(
            message="If the account exists, password reset instructions were generated.",
            reset_token=reset_token,
        )

    return ForgotPasswordResponse(
        message="If the account exists, password reset instructions were generated.",
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db_session)) -> MessageResponse:
    AuthService.reset_password(db, token=payload.token, new_password=payload.new_password)
    return MessageResponse(message="Password reset successful")
