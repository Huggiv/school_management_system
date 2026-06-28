import os
import uuid
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.db.session import get_db_session
from app.main import app
from app.models.base import Base


@pytest.fixture(scope="session")
def test_database_url() -> str:
    database_url = os.getenv("TEST_DATABASE_URL")
    if not database_url:
        pytest.skip("TEST_DATABASE_URL is required for integration tests")
    return database_url


@pytest.fixture(scope="session")
def integration_engine(test_database_url: str):
    schema_name = f"test_schema_{uuid.uuid4().hex[:8]}"
    engine = create_engine(test_database_url, future=True)
    with engine.begin() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))
        conn.execute(text(f'SET search_path TO "{schema_name}"'))
        Base.metadata.create_all(bind=conn)

    yield engine, schema_name

    with engine.begin() as conn:
        conn.execute(text(f'DROP SCHEMA IF EXISTS "{schema_name}" CASCADE'))
    engine.dispose()


@pytest.fixture()
def db_session(integration_engine) -> Generator[Session, None, None]:
    engine, schema_name = integration_engine
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    session = SessionLocal()
    session.execute(text(f'SET search_path TO "{schema_name}"'))
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def _override_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db_session] = _override_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
