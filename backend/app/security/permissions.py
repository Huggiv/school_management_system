from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from app.models.enums import UserRole
from app.models.user import User
from app.security.auth import get_current_user


def require_roles(*allowed_roles: UserRole) -> Callable[..., User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this resource",
            )
        return current_user

    return dependency
