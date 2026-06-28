from __future__ import annotations

import random
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Admission, Announcement, Assignment, Event, Grade, Student, Submission, Teacher, User
from app.models.enums import AdmissionStatus, UserRole
from app.security.auth import hash_password


RANDOM_SEED = 20260628
DEMO_PASSWORD = "Demo@1234"


DEMO_USERS = [
    {
        "email": "admin@school.local",
        "first_name": "System",
        "last_name": "Admin",
        "role": UserRole.ADMINISTRATOR,
        "phone": "+10000000000",
    },
    {
        "email": "teacher@school.local",
        "first_name": "Anita",
        "last_name": "Sharma",
        "role": UserRole.TEACHER,
        "phone": "+10000000001",
    },
    {
        "email": "student@school.local",
        "first_name": "Rahul",
        "last_name": "Kumar",
        "role": UserRole.STUDENT,
        "phone": "+10000000002",
    },
    {
        "email": "guest@school.local",
        "first_name": "Demo",
        "last_name": "Guest",
        "role": UserRole.GUEST,
        "phone": "+10000000003",
    },
]


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
    password_hash = hash_password(DEMO_PASSWORD)

    with SessionLocal() as session:
        users_by_email: dict[str, User] = {}
        for demo_user in DEMO_USERS:
            user = upsert_user(
                session,
                email=demo_user["email"],
                first_name=demo_user["first_name"],
                last_name=demo_user["last_name"],
                password=password_hash,
                role=demo_user["role"],
                phone=demo_user["phone"],
                profile_image=None,
            )
            users_by_email[user.email] = user

        admin = users_by_email["admin@school.local"]
        teacher_user = users_by_email["teacher@school.local"]
        student_user = users_by_email["student@school.local"]

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

    print("Seed complete. Demo users:")
    for demo_user in DEMO_USERS:
        role_value = demo_user["role"].value
        print(f"- {demo_user['email']} / {DEMO_PASSWORD} ({role_value})")


if __name__ == "__main__":
    run_seed()
