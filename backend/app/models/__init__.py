from app.models.admission import Admission
from app.models.announcement import Announcement
from app.models.assignment import Assignment
from app.models.base import Base
from app.models.event import Event
from app.models.gallery import Gallery
from app.models.grade import Grade
from app.models.parent import Parent
from app.models.student import Student
from app.models.submission import Submission
from app.models.teacher import Teacher
from app.models.user import User

__all__ = [
    "Base",
    "User",
    "Student",
    "Teacher",
    "Parent",
    "Admission",
    "Assignment",
    "Submission",
    "Grade",
    "Announcement",
    "Event",
    "Gallery",
]
