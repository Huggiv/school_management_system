from enum import StrEnum


class UserRole(StrEnum):
    ADMINISTRATOR = "administrator"
    PRINCIPAL = "principal"
    TEACHER = "teacher"
    STUDENT = "student"
    PARENT = "parent"
    GUEST = "guest"


class AdmissionStatus(StrEnum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    WAITLISTED = "waitlisted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
