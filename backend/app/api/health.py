from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db_session


router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready", status_code=status.HTTP_200_OK)
def readiness(db: Session = Depends(get_db_session)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ready"}
