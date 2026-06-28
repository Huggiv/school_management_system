from app.security.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password() -> None:
    hashed = hash_password("MySecurePass123")
    assert hashed != "MySecurePass123"
    assert verify_password("MySecurePass123", hashed)
    assert not verify_password("wrong-password", hashed)


def test_access_token_roundtrip() -> None:
    token = create_access_token(subject="admin@school.local", role="administrator")
    payload = decode_token(token, expected_token_type="access")
    assert payload.sub == "admin@school.local"
    assert payload.role == "administrator"
    assert payload.token_type == "access"


def test_refresh_token_roundtrip() -> None:
    token = create_refresh_token(subject="teacher@school.local", role="teacher")
    payload = decode_token(token, expected_token_type="refresh")
    assert payload.sub == "teacher@school.local"
    assert payload.role == "teacher"
    assert payload.token_type == "refresh"
