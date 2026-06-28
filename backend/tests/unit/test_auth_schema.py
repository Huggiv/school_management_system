import pytest

from app.schemas.auth import ResetPasswordRequest


def test_reset_password_schema_requires_matching_passwords() -> None:
    with pytest.raises(ValueError):
        ResetPasswordRequest(
            token="any-token",
            new_password="StrongPass123",
            confirm_password="StrongPass999",
        )


def test_reset_password_schema_accepts_valid_data() -> None:
    payload = ResetPasswordRequest(
        token="token",
        new_password="StrongPass123",
        confirm_password="StrongPass123",
    )
    assert payload.new_password == payload.confirm_password
