---
goal: End-to-end setup plan for School Management Portal from repository scaffold to Docker Compose deployment
version: 1.0
date_created: 2026-06-28
last_updated: 2026-06-28
owner: Platform and Application Team
status: "Planned"
tags: [infrastructure, feature, architecture, migration, process]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan defines deterministic implementation tasks to build the School Management Portal from an empty repository baseline to a production-ready Docker Compose deployment with FastAPI backend, React frontend, PostgreSQL, CI checks, and delivery documentation.

## 1. Requirements & Constraints

- **REQ-001**: Use Python 3.12+, FastAPI, SQLAlchemy ORM, PostgreSQL, Alembic, JWT authentication, Pydantic, and Uvicorn for backend implementation.
- **REQ-002**: Use React 19+, Vite, TypeScript, React Router, Axios, TanStack Query, React Hook Form, and Material UI or Tailwind CSS for frontend implementation.
- **REQ-003**: Implement REST modules for `/auth`, `/users`, `/students`, `/teachers`, `/parents`, `/admissions`, `/grades`, `/assignments`, `/submissions`, `/events`, `/gallery`, `/announcements`, and `/dashboard`.
- **REQ-004**: Implement role-based authorization for Administrator, Principal, Teacher, Student, Parent, and Guest.
- **REQ-005**: Support file storage for school images, student profile photos, assignment attachments, and documents.
- **REQ-006**: Deliver Docker and Docker Compose configuration for local and deployable environments.
- **REQ-007**: Provide API documentation (OpenAPI), tests, CI pipeline, deployment guide, and user documentation.
- **SEC-001**: Enforce password hashing with bcrypt and JWT token-based authentication.
- **SEC-002**: Enforce SQL injection and XSS mitigations through ORM and validated schema input.
- **SEC-003**: Enforce CSRF strategy for authenticated browser calls (same-site cookie mode or anti-CSRF token middleware).
- **SEC-004**: Ensure all secrets are environment-variable driven and not hard-coded in repository files.
- **PER-001**: Design APIs to meet p95 response time under 300 ms for paginated read endpoints.
- **ACC-001**: Ensure frontend workflows satisfy WCAG 2.1 AA keyboard and semantic landmark requirements.
- **CON-001**: Keep implementation as a single Git repository with separate `backend` and `frontend` directories.
- **CON-002**: Keep all runtime services startable using one command: `docker compose up --build`.
- **CON-003**: Use deterministic seed data for local development and test repeatability.
- **GUD-001**: Adopt strict linting and formatting gates for both backend and frontend in CI.
- **GUD-002**: Enforce typed API boundaries with Pydantic DTOs and TypeScript generated API client interfaces.
- **PAT-001**: Follow modular vertical slices in backend (`api`, `service`, `repository`, `schemas`, `models`) by domain.
- **PAT-002**: Follow role-based route guard pattern in frontend with shared auth context and protected route wrappers.

## 2. Implementation Steps

### Implementation Phase 1

- **GOAL-001**: Initialize repository scaffold, coding standards, and baseline developer tooling.
- **Completion Criteria**: Directories, package manifests, lint config, formatting config, and environment templates exist and pass initial lint checks.

| Task     | Description                                                                                                                                                                           | Completed | Date       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Create directory structure: `backend/`, `frontend/`, `infra/`, `scripts/`, `tests/`, `docs/architecture/`, `docs/runbooks/`, and `plan/` at repository root.                          | ✅        | 2026-06-28 |
| TASK-002 | Add root-level `README.md` with quick-start sections: prerequisites, local run, test, lint, and Docker usage commands.                                                                | ✅        | 2026-06-28 |
| TASK-003 | Add root `.editorconfig`, `.gitignore`, and `.env.example` containing shared keys (`APP_ENV`, `LOG_LEVEL`, `POSTGRES_*`, `JWT_*`, `STORAGE_*`).                                       | ✅        | 2026-06-28 |
| TASK-004 | Add backend dependency and tooling files: `backend/pyproject.toml`, `backend/requirements-dev.txt`, `backend/.flake8` or Ruff config, and MyPy config in `backend/pyproject.toml`.    | ✅        | 2026-06-28 |
| TASK-005 | Add frontend dependency and tooling files: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/eslint.config.js`, `frontend/prettier.config.cjs`. | ✅        | 2026-06-28 |

### Implementation Phase 2

- **GOAL-002**: Bootstrap backend application core with configuration, app lifecycle, and health endpoints.
- **Completion Criteria**: FastAPI app starts locally, OpenAPI is accessible, and `/health` and `/ready` endpoints return 200.

| Task     | Description                                                                                                                        | Completed | Date       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-006 | Create `backend/app/main.py` with `create_app()` function, CORS middleware, router registration, and startup/shutdown event hooks. | ✅        | 2026-06-28 |
| TASK-007 | Create `backend/app/core/config.py` with Pydantic settings class `Settings` and environment loading from `.env`.                   | ✅        | 2026-06-28 |
| TASK-008 | Create `backend/app/core/logging.py` with JSON and console logging profiles keyed by `APP_ENV`.                                    | ✅        | 2026-06-28 |
| TASK-009 | Create `backend/app/api/health.py` exposing `/health` and `/ready` endpoints that check database connectivity.                     | ✅        | 2026-06-28 |
| TASK-010 | Create `backend/app/db/session.py` with SQLAlchemy engine/session factory and dependency `get_db_session()`.                       | ✅        | 2026-06-28 |

### Implementation Phase 3

- **GOAL-003**: Implement database schema, migrations, and seed workflows for core entities.
- **Completion Criteria**: Alembic migration upgrades cleanly from base to head and deterministic seeds populate development data.

| Task     | Description                                                                                                                                                                             | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-011 | Create SQLAlchemy models in `backend/app/models/` for `User`, `Student`, `Teacher`, `Parent`, `Admission`, `Assignment`, `Submission`, `Grade`, `Announcement`, `Event`, and `Gallery`. |           |      |
| TASK-012 | Configure Alembic files `backend/alembic.ini`, `backend/alembic/env.py`, and initial migration under `backend/alembic/versions/` for all entities and foreign keys.                     |           |      |
| TASK-013 | Add enum definitions in `backend/app/models/enums.py` for user roles and admission status with migration-safe value handling.                                                           |           |      |
| TASK-014 | Add indexing strategy migration for frequent query fields (`email`, `role`, `student_id`, `assignment_id`, `event_date`, `published_at`).                                               |           |      |
| TASK-015 | Add seed script `backend/scripts/seed_dev_data.py` with fixed random seed and idempotent upsert behavior.                                                                               |           |      |

### Implementation Phase 4

- **GOAL-004**: Deliver authentication and authorization infrastructure with JWT and role guards.
- **Completion Criteria**: Login, token refresh, logout, forgot-password initiation, and role-protected endpoint tests pass.

| Task     | Description                                                                                                                          | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-016 | Implement auth schemas in `backend/app/schemas/auth.py` and user schemas in `backend/app/schemas/user.py` using Pydantic validation. |           |      |
| TASK-017 | Implement password and token utilities in `backend/app/security/auth.py` using bcrypt and JWT signing/verification helpers.          |           |      |
| TASK-018 | Implement auth routes in `backend/app/api/auth.py`: `/login`, `/logout`, `/forgot-password`, `/reset-password`, `/refresh-token`.    |           |      |
| TASK-019 | Implement role dependency guards in `backend/app/security/permissions.py` with explicit allow-lists per endpoint.                    |           |      |
| TASK-020 | Add auth service logic in `backend/app/services/auth_service.py` including reset token issuance and expiry validation.               |           |      |

### Implementation Phase 5

- **GOAL-005**: Implement all backend domain modules and dashboard aggregates.
- **Completion Criteria**: All required REST modules are implemented with CRUD/list filters, pagination, and role-based access.

| Task     | Description                                                                                                                                                                  | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-021 | Create routers under `backend/app/api/` for users, students, teachers, parents, admissions, grades, assignments, submissions, events, gallery, announcements, and dashboard. |           |      |
| TASK-022 | Implement service layer in `backend/app/services/` for each domain module with transactional operations and validation checks.                                               |           |      |
| TASK-023 | Implement repository/query modules in `backend/app/repositories/` with paginated filters (`page`, `size`, `sort`, `search`) and index-aligned queries.                       |           |      |
| TASK-024 | Add file upload/download handling in `backend/app/api/files.py` and `backend/app/services/storage_service.py` using local filesystem abstraction with path isolation.        |           |      |
| TASK-025 | Implement `backend/app/api/dashboard.py` aggregate endpoints returning role-specific metrics for admin, teacher, student, and parent.                                        |           |      |

### Implementation Phase 6

- **GOAL-006**: Bootstrap frontend application shell, routing, role-aware layout, and API integration foundation.
- **Completion Criteria**: Frontend builds successfully, routes render, auth context works, and protected navigation gates by role.

| Task     | Description                                                                                                                                                                                                 | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-026 | Initialize Vite React TypeScript app in `frontend/` with strict mode and path aliases in `frontend/tsconfig.json`.                                                                                          |           |      |
| TASK-027 | Create route map in `frontend/src/router/index.tsx` for `/`, `/login`, `/dashboard`, `/admission`, `/grade`, `/assignments`, `/about`, `/contact`, `/profile`, `/admin`, `/student`, `/teacher`, `/parent`. |           |      |
| TASK-028 | Create auth state provider in `frontend/src/features/auth/AuthProvider.tsx` and protected route wrapper in `frontend/src/router/ProtectedRoute.tsx`.                                                        |           |      |
| TASK-029 | Add Axios client and interceptors in `frontend/src/lib/api/client.ts` with token refresh and standardized error mapping.                                                                                    |           |      |
| TASK-030 | Add TanStack Query provider in `frontend/src/lib/query/QueryProvider.tsx` with cache policies and request retry constraints.                                                                                |           |      |

### Implementation Phase 7

- **GOAL-007**: Implement frontend feature pages and shared UI components required by requirements.
- **Completion Criteria**: All required pages are functional, responsive, accessible, and connected to backend APIs.

| Task     | Description                                                                                                                                                                                     | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-031 | Build home page components in `frontend/src/features/home/` including hero carousel, principal message, quick stats, latest announcements, events preview, gallery preview, and footer socials. |           |      |
| TASK-032 | Build responsive navigation in `frontend/src/components/navigation/` with sticky desktop menu, dropdown items, and mobile hamburger slide panel.                                                |           |      |
| TASK-033 | Build role dashboards in `frontend/src/features/dashboard/` (`AdminDashboard.tsx`, `TeacherDashboard.tsx`, `StudentDashboard.tsx`, `ParentDashboard.tsx`).                                      |           |      |
| TASK-034 | Build admission workflow in `frontend/src/features/admissions/` with React Hook Form, document uploads, and admin table with filter/search/export controls.                                     |           |      |
| TASK-035 | Build grade and assignment workflows in `frontend/src/features/grades/` and `frontend/src/features/assignments/` including create/edit/publish and submission tracking UX.                      |           |      |

### Implementation Phase 8

- **GOAL-008**: Add quality gates with unit/integration tests, static analysis, and performance checks.
- **Completion Criteria**: Test suites and lint/type checks pass in local and CI; baseline API and UI performance checks are recorded.

| Task     | Description                                                                                                                              | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-036 | Add backend unit tests in `backend/tests/unit/` for services, security helpers, and schema validation.                                   |           |      |
| TASK-037 | Add backend integration tests in `backend/tests/integration/` using FastAPI `TestClient` and temporary PostgreSQL test schema.           |           |      |
| TASK-038 | Add frontend unit/component tests in `frontend/src/**/*.test.tsx` using Vitest and Testing Library.                                      |           |      |
| TASK-039 | Add end-to-end tests in `frontend/e2e/` (Playwright) for login, role dashboard, admission submit, assignment submission, and grade view. |           |      |
| TASK-040 | Add scripts in root `Makefile` and CI workflows in `.github/workflows/` to enforce lint, type-check, tests, and build tasks.             |           |      |

### Implementation Phase 9

- **GOAL-009**: Containerize services and provide Docker Compose deployment workflow.
- **Completion Criteria**: `docker compose up --build` starts all services, backend connects to database, frontend serves application, and health checks pass.

| Task     | Description                                                                                                                                            | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-041 | Create `backend/Dockerfile` multi-stage image with dependency caching, non-root runtime user, and Uvicorn startup command.                             |           |      |
| TASK-042 | Create `frontend/Dockerfile` multi-stage image producing static bundle and serving via Nginx or Node preview server.                                   |           |      |
| TASK-043 | Create `docker-compose.yml` at repository root with services `db`, `backend`, `frontend`, named volumes, and health checks with explicit dependencies. |           |      |
| TASK-044 | Create `infra/postgres/init/` scripts for extension setup and optional seed trigger on first run.                                                      |           |      |
| TASK-045 | Create `docs/runbooks/docker-compose-deployment.md` with exact deployment steps, environment variables, backup/restore, and troubleshooting matrix.    |           |      |

### Implementation Phase 10

- **GOAL-010**: Finalize delivery artifacts, API docs, user docs, and release readiness checklist.
- **Completion Criteria**: Documentation is complete, release checklist is approved, and tagged release candidate is reproducible from clean clone.

| Task     | Description                                                                                                                               | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-046 | Add API usage documentation in `docs/api.md` with auth flow examples, pagination conventions, and module endpoint summary tables.         |           |      |
| TASK-047 | Add user documentation in `docs/user-guide.md` covering each role workflow and common troubleshooting steps.                              |           |      |
| TASK-048 | Add architecture overview in `docs/architecture/system-overview.md` with service boundaries, data flow, and security controls.            |           |      |
| TASK-049 | Add release checklist in `docs/runbooks/release-checklist.md` including migration backup gate, smoke tests, and rollback procedure.       |           |      |
| TASK-050 | Create version tag policy and changelog bootstrap in `CHANGELOG.md` and document semantic versioning process in `docs/release-policy.md`. |           |      |

## 3. Alternatives

- **ALT-001**: Use a backend-first sequence with deferred frontend start; not chosen because frontend API contract feedback is needed early to avoid DTO churn.
- **ALT-002**: Use microservices per module; not chosen because domain and team size favor a modular monolith for initial delivery speed.
- **ALT-003**: Use Supabase/Firebase managed backend; not chosen because requirements mandate FastAPI plus explicit SQLAlchemy and Alembic control.
- **ALT-004**: Use Kubernetes-first deployment; not chosen because target deliverable explicitly includes Docker Compose and simpler operational baseline.

## 4. Dependencies

- **DEP-001**: Python 3.12 runtime and pip tooling for backend.
- **DEP-002**: Node.js 22 LTS and npm/pnpm for frontend.
- **DEP-003**: PostgreSQL 16 container image for database service.
- **DEP-004**: Docker Engine and Docker Compose v2 for local and deployment packaging.
- **DEP-005**: GitHub Actions runners for CI execution of lint, test, and build pipelines.
- **DEP-006**: Optional reverse proxy/TLS termination layer (Nginx/Caddy) for production HTTPS.

## 5. Files

- **FILE-001**: `docker-compose.yml` - Orchestrates database, backend, and frontend containers.
- **FILE-002**: `backend/app/main.py` - FastAPI app entrypoint and router registration.
- **FILE-003**: `backend/app/core/config.py` - Centralized environment configuration.
- **FILE-004**: `backend/alembic/env.py` - Alembic migration environment and metadata binding.
- **FILE-005**: `backend/app/api/auth.py` - Authentication endpoints.
- **FILE-006**: `backend/app/security/permissions.py` - Role-based authorization guards.
- **FILE-007**: `frontend/src/router/index.tsx` - Frontend route definitions.
- **FILE-008**: `frontend/src/features/auth/AuthProvider.tsx` - Client auth state management.
- **FILE-009**: `frontend/src/components/navigation/Navbar.tsx` - Responsive top navigation behavior.
- **FILE-010**: `docs/runbooks/docker-compose-deployment.md` - Deployment and operations runbook.

## 6. Testing

- **TEST-001**: Backend unit test suite command: `pytest backend/tests/unit -q`.
- **TEST-002**: Backend integration suite command: `pytest backend/tests/integration -q` with isolated test database.
- **TEST-003**: Frontend unit/component suite command: `npm run test --workspace frontend`.
- **TEST-004**: Frontend type and lint checks: `npm run typecheck --workspace frontend` and `npm run lint --workspace frontend`.
- **TEST-005**: End-to-end test command: `npm run e2e --workspace frontend` against Docker Compose stack.
- **TEST-006**: Compose smoke test command: `docker compose up --build -d && docker compose ps && docker compose down`.
- **TEST-007**: Migration verification command: `alembic -c backend/alembic.ini upgrade head` and `alembic -c backend/alembic.ini downgrade -1`.

## 7. Risks & Assumptions

- **RISK-001**: Scope breadth may delay first deploy if all modules are implemented before vertical slice validation.
- **RISK-002**: File upload storage strategy can become a bottleneck without later object-storage migration.
- **RISK-003**: Role matrix complexity can introduce authorization regressions without exhaustive permission tests.
- **RISK-004**: Frontend route and API contract drift can occur without generated client types and CI contract checks.
- **ASSUMPTION-001**: One PostgreSQL instance is sufficient for initial scale and environment stages.
- **ASSUMPTION-002**: Docker Compose target is single-host deployment for MVP and staging environments.
- **ASSUMPTION-003**: School branding assets and content copy are provided before final home page polish.
- **ASSUMPTION-004**: SMTP provider credentials for password reset emails are available before auth hardening completion.

## 8. Related Specifications / Further Reading

- `docs/requirements.md`
- <https://fastapi.tiangolo.com/>
- <https://docs.sqlalchemy.org/>
- <https://alembic.sqlalchemy.org/>
- <https://react.dev/>
- <https://vite.dev/>
- <https://tanstack.com/query/latest>
- <https://docs.docker.com/compose/>
