# System Overview

## Architecture Summary

The platform is a modular monolith split across frontend and backend services.

- Frontend: React + Vite + TypeScript
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: PostgreSQL
- Packaging: Docker Compose

## Service Boundaries

### Frontend (`frontend`)

- Route handling and role-guarded navigation
- Auth state provider
- API client with token refresh interceptor
- Feature modules for home, dashboards, admissions, grades, assignments

### Backend (`backend`)

- API routers by domain in `app/api`
- Services in `app/services`
- Repositories in `app/repositories`
- Models and migrations in `app/models` + `alembic`
- Security helpers in `app/security`

### Database (`db`)

- Core relational entities for users, students, teachers, parents, admissions, assignments, submissions, grades, announcements, events, gallery
- Migration managed with Alembic

## Data Flow

1. User authenticates via `/api/v1/auth/login`.
2. Frontend stores JWT tokens and sends `Authorization` header.
3. Backend validates token and role before endpoint execution.
4. Services orchestrate business logic; repositories execute SQLAlchemy queries.
5. Response data is returned to frontend for rendering.

## Security Controls

- Password hashing with bcrypt
- JWT access and refresh token workflow
- Role-based route and endpoint guards
- Input validation with Pydantic schemas
- SQL injection mitigation through ORM query building
- Path-isolated local file storage handling

## Operational Topology

- `db` service initializes extensions and metadata scripts.
- `backend` applies migrations and serves API on port `8000`.
- `frontend` serves static bundle via Nginx on port `5173`.
