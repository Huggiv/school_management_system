---
goal: End-to-end setup plan for School Management Portal from repository scaffold to Docker Compose deployment
version: 1.0
date_created: 2026-06-28
last_updated: 2026-06-28
owner: Platform and Application Team
status: "Completed"
tags: [infrastructure, feature, architecture, migration, process]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

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

| Task     | Description                                                                                                                                                                             | Completed | Date       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-011 | Create SQLAlchemy models in `backend/app/models/` for `User`, `Student`, `Teacher`, `Parent`, `Admission`, `Assignment`, `Submission`, `Grade`, `Announcement`, `Event`, and `Gallery`. | ✅        | 2026-06-28 |
| TASK-012 | Configure Alembic files `backend/alembic.ini`, `backend/alembic/env.py`, and initial migration under `backend/alembic/versions/` for all entities and foreign keys.                     | ✅        | 2026-06-28 |
| TASK-013 | Add enum definitions in `backend/app/models/enums.py` for user roles and admission status with migration-safe value handling.                                                           | ✅        | 2026-06-28 |
| TASK-014 | Add indexing strategy migration for frequent query fields (`email`, `role`, `student_id`, `assignment_id`, `event_date`, `published_at`).                                               | ✅        | 2026-06-28 |
| TASK-015 | Add seed script `backend/scripts/seed_dev_data.py` with fixed random seed and idempotent upsert behavior.                                                                               | ✅        | 2026-06-28 |

### Implementation Phase 4

- **GOAL-004**: Deliver authentication and authorization infrastructure with JWT and role guards.
- **Completion Criteria**: Login, token refresh, logout, forgot-password initiation, and role-protected endpoint tests pass.

| Task     | Description                                                                                                                          | Completed | Date       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------- |
| TASK-016 | Implement auth schemas in `backend/app/schemas/auth.py` and user schemas in `backend/app/schemas/user.py` using Pydantic validation. | ✅        | 2026-06-28 |
| TASK-017 | Implement password and token utilities in `backend/app/security/auth.py` using bcrypt and JWT signing/verification helpers.          | ✅        | 2026-06-28 |
| TASK-018 | Implement auth routes in `backend/app/api/auth.py`: `/login`, `/logout`, `/forgot-password`, `/reset-password`, `/refresh-token`.    | ✅        | 2026-06-28 |
| TASK-019 | Implement role dependency guards in `backend/app/security/permissions.py` with explicit allow-lists per endpoint.                    | ✅        | 2026-06-28 |
| TASK-020 | Add auth service logic in `backend/app/services/auth_service.py` including reset token issuance and expiry validation.               | ✅        | 2026-06-28 |

### Implementation Phase 5

- **GOAL-005**: Implement all backend domain modules and dashboard aggregates.
- **Completion Criteria**: All required REST modules are implemented with CRUD/list filters, pagination, and role-based access.

| Task     | Description                                                                                                                                                                  | Completed | Date       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-021 | Create routers under `backend/app/api/` for users, students, teachers, parents, admissions, grades, assignments, submissions, events, gallery, announcements, and dashboard. | ✅        | 2026-06-28 |
| TASK-022 | Implement service layer in `backend/app/services/` for each domain module with transactional operations and validation checks.                                               | ✅        | 2026-06-28 |
| TASK-023 | Implement repository/query modules in `backend/app/repositories/` with paginated filters (`page`, `size`, `sort`, `search`) and index-aligned queries.                       | ✅        | 2026-06-28 |
| TASK-024 | Add file upload/download handling in `backend/app/api/files.py` and `backend/app/services/storage_service.py` using local filesystem abstraction with path isolation.        | ✅        | 2026-06-28 |
| TASK-025 | Implement `backend/app/api/dashboard.py` aggregate endpoints returning role-specific metrics for admin, teacher, student, and parent.                                        | ✅        | 2026-06-28 |

### Implementation Phase 6

- **GOAL-006**: Bootstrap frontend application shell, routing, role-aware layout, and API integration foundation.
- **Completion Criteria**: Frontend builds successfully, routes render, auth context works, and protected navigation gates by role.

| Task     | Description                                                                                                                                                                                                 | Completed | Date       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-026 | Initialize Vite React TypeScript app in `frontend/` with strict mode and path aliases in `frontend/tsconfig.json`.                                                                                          | ✅        | 2026-06-28 |
| TASK-027 | Create route map in `frontend/src/router/index.tsx` for `/`, `/login`, `/dashboard`, `/admission`, `/grade`, `/assignments`, `/about`, `/contact`, `/profile`, `/admin`, `/student`, `/teacher`, `/parent`. | ✅        | 2026-06-28 |
| TASK-028 | Create auth state provider in `frontend/src/features/auth/AuthProvider.tsx` and protected route wrapper in `frontend/src/router/ProtectedRoute.tsx`.                                                        | ✅        | 2026-06-28 |
| TASK-029 | Add Axios client and interceptors in `frontend/src/lib/api/client.ts` with token refresh and standardized error mapping.                                                                                    | ✅        | 2026-06-28 |
| TASK-030 | Add TanStack Query provider in `frontend/src/lib/query/QueryProvider.tsx` with cache policies and request retry constraints.                                                                                | ✅        | 2026-06-28 |

### Implementation Phase 7

- **GOAL-007**: Implement frontend feature pages and shared UI components required by requirements.
- **Completion Criteria**: All required pages are functional, responsive, accessible, and connected to backend APIs.

| Task     | Description                                                                                                                                                                                     | Completed | Date       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-031 | Build home page components in `frontend/src/features/home/` including hero carousel, principal message, quick stats, latest announcements, events preview, gallery preview, and footer socials. | ✅        | 2026-06-28 |
| TASK-032 | Build responsive navigation in `frontend/src/components/navigation/` with sticky desktop menu, dropdown items, and mobile hamburger slide panel.                                                | ✅        | 2026-06-28 |
| TASK-033 | Build role dashboards in `frontend/src/features/dashboard/` (`AdminDashboard.tsx`, `TeacherDashboard.tsx`, `StudentDashboard.tsx`, `ParentDashboard.tsx`).                                      | ✅        | 2026-06-28 |
| TASK-034 | Build admission workflow in `frontend/src/features/admissions/` with React Hook Form, document uploads, and admin table with filter/search/export controls.                                     | ✅        | 2026-06-28 |
| TASK-035 | Build grade and assignment workflows in `frontend/src/features/grades/` and `frontend/src/features/assignments/` including create/edit/publish and submission tracking UX.                      | ✅        | 2026-06-28 |

### Implementation Phase 8

- **GOAL-008**: Add quality gates with unit/integration tests, static analysis, and performance checks.
- **Completion Criteria**: Test suites and lint/type checks pass in local and CI; baseline API and UI performance checks are recorded.

| Task     | Description                                                                                                                              | Completed | Date       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-036 | Add backend unit tests in `backend/tests/unit/` for services, security helpers, and schema validation.                                   | ✅        | 2026-06-28 |
| TASK-037 | Add backend integration tests in `backend/tests/integration/` using FastAPI `TestClient` and temporary PostgreSQL test schema.           | ✅        | 2026-06-28 |
| TASK-038 | Add frontend unit/component tests in `frontend/src/**/*.test.tsx` using Vitest and Testing Library.                                      | ✅        | 2026-06-28 |
| TASK-039 | Add end-to-end tests in `frontend/e2e/` (Playwright) for login, role dashboard, admission submit, assignment submission, and grade view. | ✅        | 2026-06-28 |
| TASK-040 | Add scripts in root `Makefile` and CI workflows in `.github/workflows/` to enforce lint, type-check, tests, and build tasks.             | ✅        | 2026-06-28 |

### Implementation Phase 9

- **GOAL-009**: Containerize services and provide Docker Compose deployment workflow.
- **Completion Criteria**: `docker compose up --build` starts all services, backend connects to database, frontend serves application, and health checks pass.

| Task     | Description                                                                                                                                            | Completed | Date       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------- |
| TASK-041 | Create `backend/Dockerfile` multi-stage image with dependency caching, non-root runtime user, and Uvicorn startup command.                             | ✅        | 2026-06-28 |
| TASK-042 | Create `frontend/Dockerfile` multi-stage image producing static bundle and serving via Nginx or Node preview server.                                   | ✅        | 2026-06-28 |
| TASK-043 | Create `docker-compose.yml` at repository root with services `db`, `backend`, `frontend`, named volumes, and health checks with explicit dependencies. | ✅        | 2026-06-28 |
| TASK-044 | Create `infra/postgres/init/` scripts for extension setup and optional seed trigger on first run.                                                      | ✅        | 2026-06-28 |
| TASK-045 | Create `docs/runbooks/docker-compose-deployment.md` with exact deployment steps, environment variables, backup/restore, and troubleshooting matrix.    | ✅        | 2026-06-28 |

### Implementation Phase 10

- **GOAL-010**: Finalize delivery artifacts, API docs, user docs, and release readiness checklist.
- **Completion Criteria**: Documentation is complete, release checklist is approved, and tagged release candidate is reproducible from clean clone.

| Task     | Description                                                                                                                               | Completed | Date       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-046 | Add API usage documentation in `docs/api.md` with auth flow examples, pagination conventions, and module endpoint summary tables.         | ✅        | 2026-06-28 |
| TASK-047 | Add user documentation in `docs/user-guide.md` covering each role workflow and common troubleshooting steps.                              | ✅        | 2026-06-28 |
| TASK-048 | Add architecture overview in `docs/architecture/system-overview.md` with service boundaries, data flow, and security controls.            | ✅        | 2026-06-28 |
| TASK-049 | Add release checklist in `docs/runbooks/release-checklist.md` including migration backup gate, smoke tests, and rollback procedure.       | ✅        | 2026-06-28 |
| TASK-050 | Create version tag policy and changelog bootstrap in `CHANGELOG.md` and document semantic versioning process in `docs/release-policy.md`. | ✅        | 2026-06-28 |

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

## 9. Implemented Feature Analysis Snapshot (2026-06-28)

The current delivery has completed all planned tasks through TASK-050 and is production-capable for the MVP scope. Key observations for enhancement planning are listed below.

- **Backend Coverage**: Required domain APIs, role guards, JWT auth, migrations, and Docker Compose deployment are in place.
- **Frontend Coverage**: Core role-based routing and feature pages are available for admissions, grades, assignments, dashboards, and authentication.
- **Admissions Baseline**: Admission submission and application listing/filter/export are implemented in one page, with role-gated management visible to administrator/principal users.
- **Primary Gap for Next Iteration**: Admission experience is functionally complete but can be improved through workflow separation (new application vs management), stronger field validation, and improved navigation for admin operations.
- **School Development Gap**: There is no dedicated School Development Activities module for planning/tracking co-curricular growth, staff development programs, infrastructure initiatives, or community engagement activities.

## 10. Future Enhancement Plan (Post-MVP)

### Enhancement Phase 11

- **GOAL-011**: Introduce School Development Activities management to support institutional growth planning and tracking.
- **Completion Criteria**: School development activities can be created, reviewed, assigned, tracked by status/timeline, and reported by category and owner.

| Task     | Description                                                                                                                                                                                                                      | Completed | Date |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-051 | Create School Development Activities domain model and migration in backend with fields: `title`, `category`, `description`, `owner_role`, `owner_user_id`, `start_date`, `end_date`, `status`, `budget_estimate`, `impact_notes`. | ⬜        | -    |
| TASK-052 | Add backend module (`api`, `service`, `repository`) for School Development Activities with role-based permissions: admin/principal full access, teacher proposal access, parent/student read-only for published activities.        | ⬜        | -    |
| TASK-053 | Build frontend School Development Activities pages for planning board, timeline view, and progress dashboard widgets; include status tags, overdue indicators, and category filters.                                             | ⬜        | -    |
| TASK-054 | Add KPI aggregation endpoint and UI cards for development metrics (active initiatives, completion rate, delayed initiatives, category distribution, term-over-term trend).                                                       | ⬜        | -    |
| TASK-055 | Add tests for School Development Activities backend and frontend (unit/integration/e2e) including role-access checks and activity lifecycle transitions.                                                                       | ⬜        | -    |

### Enhancement Phase 12

- **GOAL-012**: Modernize Admission workflow with dedicated admin navigation, clearer application lifecycle management, and robust form validation.
- **Completion Criteria**: Admission UX separates applicant and admin flows, uses validated modern form components, and supports efficient application triage.

| Task     | Description                                                                                                                                                                                                                       | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-056 | Add admission side navigation for admin/principal users with explicit sections: `New Admission`, `Application Management`, `Review Queue`, `Decision History`, and `Reports`.                                                   | ✅        | 2026-06-28 |
| TASK-057 | Refactor frontend admission page into modular routes/components to separate new application form from application management table and review workflow.                                                                           | ✅        | 2026-06-28 |
| TASK-058 | Modernize Admission fill form with schema-based validation (Zod + React Hook Form resolver), inline field errors, accessible error summary, conditional fields, and masked input for phone/date fields.                         | ✅        | 2026-06-28 |
| TASK-059 | Add application management enhancements: bulk status actions, reviewer assignment, note history, advanced filters (status/date/class), and CSV export with selected columns.                                                     | ⬜        | -    |
| TASK-060 | Add backend admission workflow extensions for reviewer notes, state transition rules, and audit logging of decision actions (pending -> under_review -> accepted/rejected/waitlisted).                                           | ⬜        | -    |
| TASK-061 | Add admission-focused quality gates: validation rule unit tests, role-based integration tests, and e2e coverage for new submission + admin management via side navigation.                                                      | ⬜        | -    |

## 11. Suggested Priority Order

1. Implement TASK-056 to TASK-058 first (highest UX and correctness impact for daily operations).
2. Implement TASK-059 to TASK-061 second (workflow efficiency and governance).
3. Execute TASK-051 to TASK-055 as the next strategic track for school development activities.

## 12. Detailed Implementation Checklist (TASK-056 to TASK-058)

This section translates TASK-056 to TASK-058 into file-by-file implementation actions with explicit acceptance criteria.

### 12.1 TASK-056: Admission Side Navigation for Admin/Principal

**Objective**: Provide dedicated navigation context for admissions operations so admin/principal users can quickly switch between applicant entry and application management workflows.

**Implementation Actions**

1. Update route definitions in `frontend/src/router/index.tsx`:
	- Add nested admission routes:
	  - `/admission/new`
	  - `/admission/manage`
	  - `/admission/review`
	  - `/admission/history`
	  - `/admission/reports`
	- Keep `/admission` as role-aware redirect:
	  - admin/principal -> `/admission/manage`
	  - other roles -> `/admission/new`
2. Add admission operations layout wrapper in `frontend/src/features/admissions/components/AdmissionOpsLayout.tsx`:
	- Left side nav with sections:
	  - New Admission
	  - Application Management
	  - Review Queue
	  - Decision History
	  - Reports
	- Main content outlet for nested routes.
3. Create side nav component in `frontend/src/features/admissions/components/AdmissionSideNav.tsx`:
	- Use `NavLink` active styles.
	- Hide management links for non-admin/principal users.
4. Update top navigation in `frontend/src/components/navigation/Navbar.tsx`:
	- Point Admission menu item to `/admission` (redirect-based entry retained).
	- Keep existing menu structure while enabling deep-link access via nested routes.

**Acceptance Criteria**

- Admin and principal users can access all five admission operation sections via left side nav.
- Student/parent/teacher users can only access new admission flow and are blocked from management routes.
- Direct URL navigation to admission sub-routes enforces role constraints and shows the correct page.

### 12.2 TASK-057: Refactor Admission Into Modular Flows

**Objective**: Replace the current single-page mixed experience with focused, maintainable admission modules.

**Implementation Actions**

1. Split existing `frontend/src/features/admissions/AdmissionPage.tsx` into route-focused pages:
	- `frontend/src/features/admissions/pages/NewAdmissionPage.tsx`
	- `frontend/src/features/admissions/pages/ApplicationManagementPage.tsx`
	- `frontend/src/features/admissions/pages/ReviewQueuePage.tsx`
	- `frontend/src/features/admissions/pages/DecisionHistoryPage.tsx`
	- `frontend/src/features/admissions/pages/AdmissionReportsPage.tsx`
2. Create reusable components:
	- `frontend/src/features/admissions/components/AdmissionApplicationForm.tsx`
	- `frontend/src/features/admissions/components/AdmissionsTable.tsx`
	- `frontend/src/features/admissions/components/AdmissionFilters.tsx`
	- `frontend/src/features/admissions/components/AdmissionStatusBadge.tsx`
3. Create shared API hooks in `frontend/src/features/admissions/hooks/`:
	- `useAdmissionsList.ts`
	- `useCreateAdmission.ts`
	- `useAdmissionExport.ts`
4. Keep backward-compatible route entry at `/admission` by rendering layout + redirect logic; remove duplicated business logic from old monolithic page.

**Acceptance Criteria**

- No admission page contains both applicant form and management table in the same screen for admin/principal.
- Shared logic for list/create/export is reused through hooks and not duplicated across pages.
- Existing admission API endpoints remain unchanged during this refactor.

### 12.3 TASK-058: Modernize Admission Form Validation

**Objective**: Improve data quality and usability with a schema-driven validation system and accessible feedback.

**Implementation Actions**

1. Add dependencies to `frontend/package.json`:
	- `zod`
	- `@hookform/resolvers`
2. Add form schema in `frontend/src/features/admissions/validation/admissionSchema.ts`:
	- Required: student name, date of birth, gender, parent name, address, grade applying for, contact number, email.
	- Validation rules:
	  - Name fields: min/max length and character constraints.
	  - Date of birth: valid date, not in the future, minimum age boundary.
	  - Email: RFC-compliant format.
	  - Contact number: normalized + pattern check.
	  - Grade applying for: allowed enum/list values.
	  - Optional document: type and max size validation.
3. Update form component in `frontend/src/features/admissions/components/AdmissionApplicationForm.tsx`:
	- Integrate `zodResolver` with `react-hook-form`.
	- Show inline error messages under each field.
	- Add top error summary region with focus on submit failure.
	- Add input masks/formatters for date and phone fields.
4. Add conditional fields:
	- Show previous school details only when transfer toggle is enabled.
	- Show document upload requirement based on grade/transfer conditions.
5. Accessibility hardening:
	- Use `aria-invalid`, `aria-describedby`, and semantic `label` binding for all fields.
	- Ensure keyboard navigation order and visible focus states are preserved.

**Acceptance Criteria**

- Invalid form submissions never call the create admission mutation.
- Users receive clear inline and summary-level validation feedback.
- Form passes keyboard-only completion flow and screen-reader field error announcements.

### 12.4 Test & Verification Checklist for TASK-056 to TASK-058

1. Unit tests:
	- Add schema tests for each validation rule and edge case.
	- Add component tests for side nav visibility by role.
2. Integration tests:
	- Verify route-level access control for admission sub-routes.
	- Verify form submit payload shape for valid inputs.
3. E2E tests:
	- Admin flow: navigate side nav sections and filter applications.
	- Applicant flow: submit new admission with valid and invalid cases.
4. Regression checks:
	- Confirm export CSV still works for management view.
	- Confirm file upload path (`/api/v1/files/upload?category=admissions`) remains compatible.

### 12.5 Delivery Sequence (Sprint-Friendly)

1. Sprint A: TASK-056 route and side nav foundation.
2. Sprint B: TASK-057 page/component split and hook extraction.
3. Sprint C: TASK-058 validation modernization and accessibility pass.
4. Sprint D: test hardening and stabilization.
