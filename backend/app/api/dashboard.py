from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.models.admission import Admission
from app.models.announcement import Announcement
from app.models.assignment import Assignment
from app.models.enums import UserRole
from app.models.event import Event
from app.models.grade import Grade
from app.models.student import Student
from app.models.submission import Submission
from app.models.teacher import Teacher
from app.models.user import User
from app.security.auth import get_current_user
from app.security.permissions import require_roles


router = APIRouter(prefix="/dashboard")


@router.get("/admin")
def admin_dashboard(
    _: User = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, int]:
    return {
        "students": db.scalar(select(func.count(Student.id))) or 0,
        "teachers": db.scalar(select(func.count(Teacher.id))) or 0,
        "admissions": db.scalar(select(func.count(Admission.id))) or 0,
        "assignments": db.scalar(select(func.count(Assignment.id))) or 0,
        "announcements": db.scalar(select(func.count(Announcement.id))) or 0,
    }


@router.get("/teacher")
def teacher_dashboard(
    current_user: User = Depends(require_roles(UserRole.TEACHER, UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, int]:
    teacher_record = db.execute(select(Teacher).where(Teacher.user_id == current_user.id)).scalar_one_or_none()
    teacher_id = teacher_record.id if teacher_record else 0
    return {
        "today_classes": 0,
        "assignments_created": db.scalar(select(func.count(Assignment.id)).where(Assignment.teacher_id == teacher_id)) or 0,
        "submissions_to_review": db.scalar(select(func.count(Submission.id))) or 0,
    }


@router.get("/student")
def student_dashboard(
    current_user: User = Depends(require_roles(UserRole.STUDENT, UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, int]:
    student_record = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
    student_id = student_record.id if student_record else 0
    return {
        "assignments": db.scalar(select(func.count(Assignment.id))) or 0,
        "submissions": db.scalar(select(func.count(Submission.id)).where(Submission.student_id == student_id)) or 0,
        "grades": db.scalar(select(func.count(Grade.id)).where(Grade.student_id == student_id)) or 0,
    }


@router.get("/parent")
def parent_dashboard(
    _: User = Depends(require_roles(UserRole.PARENT, UserRole.ADMINISTRATOR, UserRole.PRINCIPAL)),
    db: Session = Depends(get_db_session),
) -> dict[str, int]:
    upcoming_events = db.scalar(select(func.count(Event.id)).where(Event.event_date >= date.today())) or 0
    return {
        "child_grades": db.scalar(select(func.count(Grade.id))) or 0,
        "child_submissions": db.scalar(select(func.count(Submission.id))) or 0,
        "upcoming_events": upcoming_events,
    }


@router.get("/me")
def my_dashboard(current_user: User = Depends(get_current_user)) -> dict[str, str]:
    role_value = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    return {"role": role_value, "route_hint": f"/api/v1/dashboard/{role_value}"}
