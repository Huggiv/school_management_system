from fastapi import APIRouter

from app.api.admissions import router as admissions_router
from app.api.announcements import router as announcements_router
from app.api.assignments import router as assignments_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.events import router as events_router
from app.api.exam_results import router as exam_results_router
from app.api.exam_sessions import router as exam_sessions_router
from app.api.exam_subjects import router as exam_subjects_router
from app.api.fee_payments import router as fee_payments_router
from app.api.fee_structures import router as fee_structures_router
from app.api.files import router as files_router
from app.api.gallery import router as gallery_router
from app.api.grades import router as grades_router
from app.api.health import router as health_router
from app.api.parents import router as parents_router
from app.api.students import router as students_router
from app.api.student_fee_ledgers import router as student_fee_ledgers_router
from app.api.student_parents import router as student_parents_router
from app.api.subjects import router as subjects_router
from app.api.submissions import router as submissions_router
from app.api.teachers import router as teachers_router
from app.api.users import router as users_router


api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(users_router, tags=["users"])
api_router.include_router(students_router, tags=["students"])
api_router.include_router(teachers_router, tags=["teachers"])
api_router.include_router(parents_router, tags=["parents"])
api_router.include_router(admissions_router, tags=["admissions"])
api_router.include_router(grades_router, tags=["grades"])
api_router.include_router(assignments_router, tags=["assignments"])
api_router.include_router(submissions_router, tags=["submissions"])
api_router.include_router(events_router, tags=["events"])
api_router.include_router(gallery_router, tags=["gallery"])
api_router.include_router(announcements_router, tags=["announcements"])
api_router.include_router(subjects_router, tags=["subjects"])
api_router.include_router(exam_sessions_router, tags=["exam-sessions"])
api_router.include_router(exam_subjects_router, tags=["exam-subjects"])
api_router.include_router(exam_results_router, tags=["exam-results"])
api_router.include_router(student_parents_router, tags=["student-parents"])
api_router.include_router(fee_structures_router, tags=["fee-structures"])
api_router.include_router(student_fee_ledgers_router, tags=["student-fee-ledgers"])
api_router.include_router(fee_payments_router, tags=["fee-payments"])
api_router.include_router(files_router, tags=["files"])
api_router.include_router(dashboard_router, tags=["dashboard"])

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(health_router, tags=["health"])
v1_router.include_router(auth_router, tags=["auth"])
v1_router.include_router(users_router, tags=["users"])
v1_router.include_router(students_router, tags=["students"])
v1_router.include_router(teachers_router, tags=["teachers"])
v1_router.include_router(parents_router, tags=["parents"])
v1_router.include_router(admissions_router, tags=["admissions"])
v1_router.include_router(grades_router, tags=["grades"])
v1_router.include_router(assignments_router, tags=["assignments"])
v1_router.include_router(submissions_router, tags=["submissions"])
v1_router.include_router(events_router, tags=["events"])
v1_router.include_router(gallery_router, tags=["gallery"])
v1_router.include_router(announcements_router, tags=["announcements"])
v1_router.include_router(subjects_router, tags=["subjects"])
v1_router.include_router(exam_sessions_router, tags=["exam-sessions"])
v1_router.include_router(exam_subjects_router, tags=["exam-subjects"])
v1_router.include_router(exam_results_router, tags=["exam-results"])
v1_router.include_router(student_parents_router, tags=["student-parents"])
v1_router.include_router(fee_structures_router, tags=["fee-structures"])
v1_router.include_router(student_fee_ledgers_router, tags=["student-fee-ledgers"])
v1_router.include_router(fee_payments_router, tags=["fee-payments"])
v1_router.include_router(files_router, tags=["files"])
v1_router.include_router(dashboard_router, tags=["dashboard"])
