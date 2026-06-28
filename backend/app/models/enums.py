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
    ACCEPTED = "accepted"
    REJECTED = "rejected"
