from __future__ import annotations

import random
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Admission, Announcement, Assignment, Event, Grade, Student, Submission, Teacher, User
from app.models.enums import AdmissionStatus, UserRole


RANDOM_SEED = 20260628


def upsert_user(session, email: str, **fields) -> User:
    existing = session.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if existing:
        for key, value in fields.items():
            setattr(existing, key, value)
        return existing

    user = User(email=email, **fields)
    session.add(user)
    session.flush()
    return user


def run_seed() -> None:
    random.seed(RANDOM_SEED)
    now = datetime.now(timezone.utc)

    with SessionLocal() as session:
        admin = upsert_user(
            session,
            email="admin@school.local",
            first_name="System",
            last_name="Admin",
            password="$2b$12$replace.with.real.bcrypt.hash",
            role=UserRole.ADMINISTRATOR,
            phone="+10000000000",
            profile_image=None,
        )

        teacher_user = upsert_user(
            session,
            email="teacher@school.local",
            first_name="Anita",
            last_name="Sharma",
            password="$2b$12$replace.with.real.bcrypt.hash",
            role=UserRole.TEACHER,
            phone="+10000000001",
            profile_image=None,
        )

        student_user = upsert_user(
            session,
            email="student@school.local",
            first_name="Rahul",
            last_name="Kumar",
            password="$2b$12$replace.with.real.bcrypt.hash",
            role=UserRole.STUDENT,
            phone="+10000000002",
            profile_image=None,
        )

        teacher = session.execute(
            select(Teacher).where(Teacher.employee_id == "EMP-1001")
        ).scalar_one_or_none()
        if not teacher:
            teacher = Teacher(
                user_id=teacher_user.id,
                employee_id="EMP-1001",
                department="Science",
                qualification="M.Ed",
            )
            session.add(teacher)
            session.flush()

        student = session.execute(
            select(Student).where(Student.admission_number == "ADM-2026-0001")
        ).scalar_one_or_none()
        if not student:
            student = Student(
                user_id=student_user.id,
                admission_number="ADM-2026-0001",
                class_name="10",
                section="A",
                guardian="Rakesh Kumar",
            )
            session.add(student)
            session.flush()

        admission = session.execute(
            select(Admission).where(Admission.application_number == "APP-2026-0001")
        ).scalar_one_or_none()
        if not admission:
            session.add(
                Admission(
                    application_number="APP-2026-0001",
                    student_name="Rahul Kumar",
                    status=AdmissionStatus.ACCEPTED,
                )
            )

        assignment = session.execute(
            select(Assignment).where(Assignment.title == "Physics Worksheet 1")
        ).scalar_one_or_none()
        if not assignment:
            assignment = Assignment(
                teacher_id=teacher.id,
                title="Physics Worksheet 1",
                description="Kinematics chapter practice set.",
                due_date=now + timedelta(days=7),
                attachment="/storage/assignments/physics-worksheet-1.pdf",
            )
            session.add(assignment)
            session.flush()

        submission = session.execute(
            select(Submission).where(
                Submission.assignment_id == assignment.id,
                Submission.student_id == student.id,
            )
        ).scalar_one_or_none()
        if not submission:
            session.add(
                Submission(
                    assignment_id=assignment.id,
                    student_id=student.id,
                    uploaded_file="/storage/submissions/rahul-physics-worksheet-1.pdf",
                    submitted_at=now,
                    marks=round(random.uniform(78, 95), 2),
                )
            )

        grade = session.execute(
            select(Grade).where(Grade.student_id == student.id, Grade.subject == "Physics")
        ).scalar_one_or_none()
        if not grade:
            session.add(
                Grade(
                    student_id=student.id,
                    subject="Physics",
                    marks=88.5,
                    grade="A",
                    remarks="Consistent progress",
                )
            )

        event = session.execute(select(Event).where(Event.title == "Annual Sports Day")).scalar_one_or_none()
        if not event:
            session.add(
                Event(
                    title="Annual Sports Day",
                    description="Inter-house athletics and games.",
                    event_date=date.today() + timedelta(days=14),
                )
            )

        announcement = session.execute(
            select(Announcement).where(Announcement.title == "Welcome to New Session")
        ).scalar_one_or_none()
        if not announcement:
            session.add(
                Announcement(
                    title="Welcome to New Session",
                    content="New academic session begins next Monday.",
                    published_at=now,
                )
            )

        _ = admin
        session.commit()


if __name__ == "__main__":
    run_seed()
